import uuid
from typing import Annotated

import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.db.postgres import get_pool

security = HTTPBearer()

_jwk_client: PyJWKClient | None = None


def _get_jwk_client() -> PyJWKClient:
    global _jwk_client
    if _jwk_client is None:
        jwks_url = f"https://{settings.CLERK_ISSUER}/.well-known/jwks.json"
        _jwk_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwk_client


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
            "issuer": f"https://{settings.CLERK_ISSUER}",
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
