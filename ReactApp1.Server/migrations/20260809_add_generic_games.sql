-- Apply after 20260809_add_durable_move_idempotency.sql to an existing database.
BEGIN;

CREATE TABLE IF NOT EXISTS game_actions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sequence_number int NOT NULL CHECK (sequence_number > 0),
    player_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    idempotency_key uuid NOT NULL,
    action_type text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT game_actions_match_sequence_unique UNIQUE (match_id, sequence_number),
    CONSTRAINT game_actions_match_player_idempotency_key_unique UNIQUE (match_id, player_user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_game_actions_match ON game_actions(match_id);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), category text NOT NULL, question text NOT NULL UNIQUE,
    options jsonb NOT NULL, correct_option_index int NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Re-run tablas.sql's quiz_questions INSERT block once to load the 40-question bank,
-- then make all current catalog games two-player.
UPDATE games SET max_players = 2 WHERE slug IN ('memory', 'trivia', 'tic-tac-toe');
COMMIT;
