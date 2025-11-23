INSERT INTO users (nickname, full_name, email, password_hash)
VALUES
  ('normal_user', 'normal123', 'user@example.com', '$2a$10$abcdefghijklmnopqrstuv') ON CONFLICT DO NOTHING;
INSERT INTO users (nickname, full_name, email, password_hash, role)
VALUES
  ('admin_master', 'admin_123', 'admin@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO users (nickname, full_name, email, password_hash, role)
VALUES
  ('colab_guy', 'colab_123', 'colab@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'collaborator') ON CONFLICT DO NOTHING;