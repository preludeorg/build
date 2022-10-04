CREATE TABLE IF NOT EXISTS manifest (
    account_id TEXT NOT NULL,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    classification TEXT NOT NULL,
    created timestamp default current_timestamp,
    PRIMARY KEY(account_id, id)
);