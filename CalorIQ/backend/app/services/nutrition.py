import re
import random


def mock_nutrition(name: str) -> dict:
    """Generate mock nutrition data for a food item."""
    return {
        "name": name,
        "calories": round(random.uniform(150, 500), 1),
        "protein_g": round(random.uniform(5, 30), 1),
        "carbohydrates_total_g": round(random.uniform(10, 60), 1),
        "fat_total_g": round(random.uniform(5, 25), 1),
        "fat_saturated_g": round(random.uniform(1, 10), 1),
        "fiber_g": round(random.uniform(0.5, 8), 1),
        "sugar_g": round(random.uniform(0.5, 15), 1),
        "sodium_mg": round(random.uniform(50, 500), 1),
        "potassium_mg": round(random.uniform(100, 600), 1),
        "cholesterol_mg": round(random.uniform(0, 100), 1),
        "serving_size_g": 100.0,
        "source": "mock",
    }


def parse_food_description(description: str) -> list[str]:
    """Parse a food description into individual food items.

    Splits on commas and 'and', strips whitespace, filters empty strings.
    """
    parts = re.split(r",|\band\b", description, flags=re.IGNORECASE)
    items = [part.strip() for part in parts if part.strip()]
    return items


def get_nutrition_for_description(description: str) -> list[dict]:
    """Parse description and return mock nutrition for each food item."""
    items = parse_food_description(description)
    return [mock_nutrition(item) for item in items]
