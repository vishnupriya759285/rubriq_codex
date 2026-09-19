"""Add Campus Knowledge Network tables and indexes."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "0017_campus_network"
down_revision = "0016_production_hardening"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    tables = set(inspector.get_table_names())

    if "expertise_categories" not in tables:
        op.create_table(
            "expertise_categories",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("name", sa.String(100), nullable=False, unique=True),
            sa.Column("slug", sa.String(100), nullable=False, unique=True),
            sa.Column("description", sa.Text(), nullable=False, server_default=""),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "mentor_profiles" not in tables:
        op.create_table(
            "mentor_profiles",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False, unique=True),
            sa.Column("display_name", sa.String(120), nullable=False),
            sa.Column("display_role", sa.String(50), nullable=False),
            sa.Column("department", sa.String(100), nullable=False, server_default=""),
            sa.Column("year_or_batch", sa.String(50), nullable=False, server_default=""),
            sa.Column("bio", sa.Text(), nullable=False, server_default=""),
            sa.Column("projects", sa.JSON(), nullable=False),
            sa.Column("skills", sa.JSON(), nullable=False),
            sa.Column("research_interests", sa.JSON(), nullable=False),
            sa.Column("mentoring_topics", sa.JSON(), nullable=False),
            sa.Column("availability", sa.String(120), nullable=False, server_default=""),
            sa.Column("linkedin_url", sa.String(255), nullable=True),
            sa.Column("github_url", sa.String(255), nullable=True),
            sa.Column("portfolio_url", sa.String(255), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "user_expertise" not in tables:
        op.create_table(
            "user_expertise",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("mentor_id", sa.String(36), sa.ForeignKey("mentor_profiles.id"), nullable=False),
            sa.Column("category_id", sa.String(36), sa.ForeignKey("expertise_categories.id"), nullable=False),
            sa.Column("concept_tag", sa.String(100), nullable=False),
            sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
            sa.Column("verified_by_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=True),
            sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("review_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "network_questions" not in tables:
        op.create_table(
            "network_questions",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("author_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
            sa.Column("target_mentor_id", sa.String(36), sa.ForeignKey("mentor_profiles.id"), nullable=True),
            sa.Column("concept_tag", sa.String(100), nullable=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column("mode", sa.String(20), nullable=False, server_default="public"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "question_responses" not in tables:
        op.create_table(
            "question_responses",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("question_id", sa.String(36), sa.ForeignKey("network_questions.id"), nullable=False),
            sa.Column("responder_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column("is_accepted_solution", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "network_connections" not in tables:
        op.create_table(
            "network_connections",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("requester_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
            sa.Column("recipient_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
            sa.Column("concept_tag", sa.String(100), nullable=True),
            sa.Column("note", sa.Text(), nullable=True),
            sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.UniqueConstraint("requester_account_id", "recipient_account_id", name="uq_network_connection"),
        )

    if "network_conversations" not in tables:
        op.create_table(
            "network_conversations",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("connection_id", sa.String(36), sa.ForeignKey("network_connections.id"), nullable=False, unique=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "network_messages" not in tables:
        op.create_table(
            "network_messages",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("conversation_id", sa.String(36), sa.ForeignKey("network_conversations.id"), nullable=False),
            sa.Column("sender_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "network_notifications" not in tables:
        op.create_table(
            "network_notifications",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("recipient_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
            sa.Column("actor_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=True),
            sa.Column("type", sa.String(50), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column("link_url", sa.String(255), nullable=True),
            sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "learning_circles" not in tables:
        op.create_table(
            "learning_circles",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("creator_account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
            sa.Column("title", sa.String(200), nullable=False),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("concept_tag", sa.String(100), nullable=True),
            sa.Column("category_id", sa.String(36), sa.ForeignKey("expertise_categories.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )

    if "learning_circle_members" not in tables:
        op.create_table(
            "learning_circle_members",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("circle_id", sa.String(36), sa.ForeignKey("learning_circles.id"), nullable=False),
            sa.Column("account_id", sa.String(36), sa.ForeignKey("accounts.id"), nullable=False),
            sa.Column("role", sa.String(30), nullable=False, server_default="member"),
            sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.UniqueConstraint("circle_id", "account_id", name="uq_circle_member"),
        )

    # Create Indexes
    indexes = [
        ("ix_mentor_profiles_account_id", "mentor_profiles", ["account_id"]),
        ("ix_user_expertise_mentor_id", "user_expertise", ["mentor_id"]),
        ("ix_user_expertise_category_id", "user_expertise", ["category_id"]),
        ("ix_user_expertise_concept_tag", "user_expertise", ["concept_tag"]),
        ("ix_user_expertise_status", "user_expertise", ["status"]),
        ("ix_network_questions_author", "network_questions", ["author_account_id"]),
        ("ix_network_questions_target", "network_questions", ["target_mentor_id"]),
        ("ix_network_questions_concept", "network_questions", ["concept_tag"]),
        ("ix_network_questions_mode", "network_questions", ["mode"]),
        ("ix_question_responses_question", "question_responses", ["question_id"]),
        ("ix_network_connections_requester", "network_connections", ["requester_account_id"]),
        ("ix_network_connections_recipient", "network_connections", ["recipient_account_id"]),
        ("ix_network_connections_status", "network_connections", ["status"]),
        ("ix_network_messages_conv", "network_messages", ["conversation_id"]),
        ("ix_network_notifications_recip", "network_notifications", ["recipient_account_id"]),
        ("ix_learning_circles_creator", "learning_circles", ["creator_account_id"]),
        ("ix_learning_circles_concept", "learning_circles", ["concept_tag"]),
    ]
    for name, table, cols in indexes:
        if table in set(inspect(bind).get_table_names()):
            existing = {idx["name"] for idx in inspect(bind).get_indexes(table)}
            if name not in existing:
                op.create_index(name, table, cols)


def downgrade() -> None:
    op.drop_table("learning_circle_members")
    op.drop_table("learning_circles")
    op.drop_table("network_notifications")
    op.drop_table("network_messages")
    op.drop_table("network_conversations")
    op.drop_table("network_connections")
    op.drop_table("question_responses")
    op.drop_table("network_questions")
    op.drop_table("user_expertise")
    op.drop_table("mentor_profiles")
    op.drop_table("expertise_categories")
