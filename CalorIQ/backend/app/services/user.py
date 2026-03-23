import uuid

from app.db.postgres import get_pool
from app.services.cache import SummaryCache

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

GOAL_ADJUSTMENTS = {
    "lose": -500,
    "maintain": 0,
    "gain": 300,
}


def calculate_calorie_target(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str,
    goal: str,
) -> int:
    """Calculate daily calorie target using Mifflin-St Jeor equation."""
    if gender.lower() == "male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.2)
    tdee = bmr * multiplier

    adjustment = GOAL_ADJUSTMENTS.get(goal, 0)
    target = tdee + adjustment

    return max(1200, round(target))


async def get_user_with_profile(user_id: uuid.UUID) -> dict | None:
    """Get user and their profile."""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT
                u.id, u.clerk_id, u.email, u.name, u.timezone,
                u.created_at, u.updated_at,
                p.weight_kg, p.height_cm, p.age, p.gender,
                p.activity_level, p.goal, p.daily_calorie_target,
                p.updated_at as profile_updated_at
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = $1
            """,
            user_id,
        )

    if not row:
        return None

    result = {
        "id": str(row["id"]),
        "clerk_id": row["clerk_id"],
        "email": row["email"],
        "name": row["name"],
        "timezone": row["timezone"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
        "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None,
        "profile": None,
    }

    if row["weight_kg"] is not None:
        result["profile"] = {
            "weight_kg": row["weight_kg"],
            "height_cm": row["height_cm"],
            "age": row["age"],
            "gender": row["gender"],
            "activity_level": row["activity_level"],
            "goal": row["goal"],
            "daily_calorie_target": row["daily_calorie_target"],
            "updated_at": (
                row["profile_updated_at"].isoformat()
                if row["profile_updated_at"]
                else None
            ),
        }

    return result


async def get_profile(user_id: uuid.UUID) -> dict | None:
    """Fetch user profile only."""
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT weight_kg, height_cm, age, gender, activity_level, goal,
                   daily_calorie_target, updated_at
            FROM user_profiles
            WHERE user_id = $1
            """,
            user_id,
        )

    if not row:
        return None

    return {
        "weight_kg": row["weight_kg"],
        "height_cm": row["height_cm"],
        "age": row["age"],
        "gender": row["gender"],
        "activity_level": row["activity_level"],
        "goal": row["goal"],
        "daily_calorie_target": row["daily_calorie_target"],
        "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None,
    }


async def upsert_profile(
    user_id: uuid.UUID,
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str,
    goal: str,
) -> dict:
    """Create or update user profile with calculated calorie target."""
    daily_calorie_target = calculate_calorie_target(
        weight_kg, height_cm, age, gender, activity_level, goal
    )

    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO user_profiles
                (user_id, weight_kg, height_cm, age, gender,
                 activity_level, goal, daily_calorie_target)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (user_id) DO UPDATE SET
                weight_kg = $2,
                height_cm = $3,
                age = $4,
                gender = $5,
                activity_level = $6,
                goal = $7,
                daily_calorie_target = $8,
                updated_at = NOW()
            """,
            user_id,
            weight_kg,
            height_cm,
            age,
            gender,
            activity_level,
            goal,
            daily_calorie_target,
        )

    await SummaryCache.invalidate_all_for_user(user_id)

    return {
        "weight_kg": weight_kg,
        "height_cm": height_cm,
        "age": age,
        "gender": gender,
        "activity_level": activity_level,
        "goal": goal,
        "daily_calorie_target": daily_calorie_target,
    }
