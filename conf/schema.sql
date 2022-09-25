CREATE TABLE IF NOT EXISTS manifest (
    account_id TEXT NOT NULL,
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    classification TEXT NOT NULL,
    created timestamp default current_timestamp
);
CREATE TABLE IF NOT EXISTS results (
    account_id TEXT NOT NULL,
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status INT NOT NULL,
    cpu FLOAT NOT NULL,
    created timestamp default current_timestamp
);