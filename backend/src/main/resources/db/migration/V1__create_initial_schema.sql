CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'TECNICO', 'USUARIO')),
    CONSTRAINT ck_users_name_not_blank CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_categories_code UNIQUE (code),
    CONSTRAINT uk_categories_name UNIQUE (name),
    CONSTRAINT ck_categories_code_format CHECK (code ~ '^[A-Z][A-Z0-9_]{1,49}$'),
    CONSTRAINT ck_categories_name_not_blank CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ABERTO',
    requester_id UUID NOT NULL,
    assignee_id UUID,
    version BIGINT NOT NULL DEFAULT 0,
    resolved_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_requester FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_assignee FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_tickets_priority CHECK (priority IN ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA')),
    CONSTRAINT ck_tickets_status CHECK (status IN ('ABERTO', 'EM_ATENDIMENTO', 'AGUARDANDO_USUARIO', 'RESOLVIDO', 'FECHADO')),
    CONSTRAINT ck_tickets_title_not_blank CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT ck_tickets_description_not_blank CHECK (LENGTH(TRIM(description)) > 0)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL,
    author_id UUID NOT NULL,
    content VARCHAR(4000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_comments_content_not_blank CHECK (LENGTH(TRIM(content)) > 0)
);

CREATE TABLE ticket_history (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    field_name VARCHAR(80),
    old_value VARCHAR(1000),
    new_value VARCHAR(1000),
    description VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_history_ticket FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_history_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_ticket_history_event_type CHECK (
        event_type IN (
            'CRIACAO',
            'ATUALIZACAO',
            'ALTERACAO_STATUS',
            'ATRIBUICAO',
            'REMOCAO_ATRIBUICAO',
            'COMENTARIO',
            'EXCLUSAO',
            'RESTAURACAO'
        )
    )
);

CREATE INDEX idx_tickets_status ON tickets (status);
CREATE INDEX idx_tickets_priority ON tickets (priority);
CREATE INDEX idx_tickets_requester ON tickets (requester_id);
CREATE INDEX idx_tickets_assignee ON tickets (assignee_id);
CREATE INDEX idx_tickets_category ON tickets (category_id);
CREATE INDEX idx_tickets_created_at ON tickets (created_at DESC);
CREATE INDEX idx_tickets_assignee_status ON tickets (assignee_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_ticket_created_at ON comments (ticket_id, created_at);
CREATE INDEX idx_ticket_history_ticket_created_at ON ticket_history (ticket_id, created_at);
