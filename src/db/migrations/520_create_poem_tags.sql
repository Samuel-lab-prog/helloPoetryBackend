CREATE TABLE poem_tags (
    poem_id INT NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (poem_id, tag_id)
);