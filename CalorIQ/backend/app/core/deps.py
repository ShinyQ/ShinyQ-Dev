import uuid
import logging
from typing import Annotated

import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import httpx

from app.core.config import settings
from app.db.postgres import get_pool

security = HTTPBearer()
logger = logging.getLogger(__name__)

_jwk_client: PyJWKClient | None = None


def _normalize_issuer(issuer: str) -> str:
    """Ensure issuer is a full URL with https://."""
    issuer = issuer.strip().rstrip("/")
    if issuer.startswith("https://"):
        return issuer
    if issuer.startswith("http://"):
        return issuer
    return f"https://{issuer}"


def _get_jwk_client() -> PyJWKClient:
    global _jwk_client
    if _jwk_client is None:
        base = _normalize_issuer(settings.CLERK_ISSUER)
        jwks_url = f"{base}/.well-known/jwks.json"
        _jwk_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwk_client


async def _fetch_clerk_identity(clerk_id: str) -> tuple[str | None, str | None]:
    if not settings.CLERK_SECRET_KEY:
        return None, None

    url = f"https://api.clerk.com/v1/users/{clerk_id}"
    headers = {
        "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, headers=headers)
        if response.status_code != 200:
            logger.warning(
                "clerk_user_fetch_failed clerk_id=%s status=%s",
                clerk_id,
                response.status_code,
            )
            return None, None

        data = response.json()
        emails = data.get("email_addresses") or []
        email_value: str | None = None
        for entry in emails:
            if entry.get("id") == data.get("primary_email_address_id"):
                email_value = entry.get("email_address")
                break
        if email_value is None and emails:
            email_value = emails[0].get("email_address")

        name_value = (
            data.get("full_name")
            or " ".join(
                part
                for part in [data.get("first_name"), data.get("last_name")]
                if part
            ).strip()
            or data.get("username")
        )
        name_value = name_value or None
        return email_value, name_value
    except Exception:  # noqa: BLE001
        logger.exception("clerk_user_fetch_error clerk_id=%s", clerk_id)
        return None, None


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    token = credentials.credentials

    try:
        jwk_client = _get_jwk_client()
        signing_key = jwk_client.get_signing_key_from_jwt(token)

        decode_options: dict = {}
        decode_kwargs: dict = {
            "algorithms": ["RS256"],
            "issuer": _normalize_issuer(settings.CLERK_ISSUER),
            "options": decode_options,
        }
        if settings.CLERK_AUDIENCE:
            decode_kwargs["audience"] = settings.CLERK_AUDIENCE
        else:
            decode_options["verify_aud"] = False

        payload = jwt.decode(
            token,
            signing_key.key,
            **decode_kwargs,
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
        )

    clerk_id: str = payload.get("sub", "")
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing sub claim",
        )

    email: str = payload.get("email", "")
    name: str = payload.get("name", "")

    if not email or not name:
        fetched_email, fetched_name = await _fetch_clerk_identity(clerk_id)
        if not email:
            email = fetched_email or f"{clerk_id}@users.clerk.local"
        if not name:
            name = fetched_name or ""

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO users (id, clerk_id, email, name)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (clerk_id) DO UPDATE
                SET email = COALESCE(EXCLUDED.email, users.email),
                    name  = COALESCE(EXCLUDED.name, users.name),
                    updated_at = NOW()
            RETURNING id, clerk_id
            """,
            uuid.uuid4(),
            clerk_id,
            email or None,
            name or None,
        )

    return {
        "user_id": row["id"],
        "clerk_id": row["clerk_id"],
    }
