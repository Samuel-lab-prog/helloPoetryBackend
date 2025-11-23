INSERT INTO avatars (name, path) VALUES ('Kuromi', 'Kuromi.png') ON CONFLICT (name) DO NOTHING;
INSERT INTO avatars (name, path) VALUES ('My Melody', 'My Melody.png') ON CONFLICT (name) DO NOTHING;
INSERT INTO avatars (name, path) VALUES ('Hello Kitty', 'Hello Kitty.png') ON CONFLICT (name) DO NOTHING;