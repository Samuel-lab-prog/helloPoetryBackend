CREATE TABLE poems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    slug VARCHAR(200) NOT NULL UNIQUE,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        moderation_status IN ('clean', 'pending', 'flagged')
    ),
    visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (
        visibility IN (
            'public',
            'private',
            'unlisted'
        )
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'published')
    ),
    likes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP
    WITH
        TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NULL,
        deleted_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NULL,
        published_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NULL
);