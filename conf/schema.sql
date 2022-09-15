CREATE TABLE IF NOT EXISTS manifest (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    classification TEXT NOT NULL,
    created timestamp default current_timestamp,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status INT NOT NULL,
    cpu FLOAT NOT NULL,
    created timestamp default current_timestamp
);