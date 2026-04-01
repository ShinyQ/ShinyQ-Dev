"""initial schema

Revision ID: 1ae425cb21b0
Revises:
Create Date: 2025-01-01 00:00:00.000000

Stub representing the initial DB state (tables already created via create_all).
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1ae425cb21b0'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Initial tables were created outside of Alembic — this is a marker only.
    pass


def downgrade() -> None:
    pass
