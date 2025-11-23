INSERT INTO poem_tags (poem_id, tag_id) VALUES (1, 1) ON CONFLICT DO NOTHING;
INSERT INTO poem_tags (poem_id, tag_id) VALUES (1, 2) ON CONFLICT DO NOTHING;
INSERT INTO poem_tags (poem_id, tag_id) VALUES (2, 3) ON CONFLICT DO NOTHING;
INSERT INTO poem_tags (poem_id, tag_id) VALUES (2, 4) ON CONFLICT DO NOTHING;
INSERT INTO poem_tags (poem_id, tag_id) VALUES (3, 5) ON CONFLICT DO NOTHING;
INSERT INTO poem_tags (poem_id, tag_id) VALUES (3, 6) ON CONFLICT DO NOTHING;