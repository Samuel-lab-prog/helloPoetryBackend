CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    nickname VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(50) DEFAULT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    bio VARCHAR(500) DEFAULT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'collaborator')),

    avatar_id INT DEFAULT NULL,
    personality_id INT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NULL,
    deleted_at TIMESTAMP DEFAULT NULL,
    last_login TIMESTAMP DEFAULT NULL,

    reset_token TEXT DEFAULT NULL,
    reset_token_expires TIMESTAMP DEFAULT NULL,

    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT DEFAULT NULL,
    email_verification_expires TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (avatar_id) REFERENCES avatars(id) ON DELETE SET NULL,
    FOREIGN KEY (personality_id) REFERENCES personalities(id) ON DELETE SET NULL
);
