"""add refresh_tokens table and user role

Revision ID: 001_refresh_rbac
Revises: 
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = '001_refresh_rbac'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Создаём enum тип для роли пользователя
    userrole = sa.Enum('parent', 'admin', name='userrole')
    userrole.create(op.get_bind(), checkfirst=True)

    # Добавляем колонку role в таблицу users (если не существует)
    op.add_column(
        'users',
        sa.Column('role', sa.Enum('parent', 'admin', name='userrole'),
                  nullable=False, server_default='parent')
    )

    # Создаём таблицу refresh_tokens
    op.create_table(
        'refresh_tokens',
        sa.Column('id',         sa.Integer(),  primary_key=True, index=True),
        sa.Column('user_id',    sa.Integer(),  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token',      sa.String(),   nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('revoked',    sa.Boolean(),  nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
    )
    op.create_index('ix_refresh_tokens_token',   'refresh_tokens', ['token'],   unique=True)
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'], unique=False)


def downgrade() -> None:
    # Явно удаляем индексы перед drop_table
    op.drop_index('ix_refresh_tokens_token',   table_name='refresh_tokens')
    op.drop_index('ix_refresh_tokens_user_id', table_name='refresh_tokens')
    op.drop_table('refresh_tokens')
    
    # Удаляем колонку role из users
    op.drop_column('users', 'role')
    
    # Удаляем enum тип (с checkfirst для безопасности)
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)