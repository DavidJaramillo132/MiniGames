-- Apply once to existing PlayHub PostgreSQL databases.
-- The checks below stop rather than discard rows whose authenticated actor or
-- tic-tac-toe data cannot be inferred safely.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE moves ADD COLUMN IF NOT EXISTS idempotency_key uuid;
UPDATE moves
SET idempotency_key = uuid_generate_v4()
WHERE idempotency_key IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM moves WHERE player_user_id IS NULL) THEN
        RAISE EXCEPTION
            'Cannot make moves.player_user_id NOT NULL: existing move rows have no authenticated player. Backfill or remove those rows explicitly before rerunning this migration.';
    END IF;

    IF EXISTS (SELECT 1 FROM moves WHERE turn_number <= 0) THEN
        RAISE EXCEPTION
            'Cannot add move turn constraint: existing rows have turn_number <= 0.';
    END IF;

    IF EXISTS (SELECT 1 FROM moves WHERE cell_index NOT BETWEEN 0 AND 8) THEN
        RAISE EXCEPTION
            'Cannot add tic-tac-toe cell constraint: existing rows have cell_index outside 0..8.';
    END IF;

    IF EXISTS (SELECT 1 FROM moves WHERE symbol NOT IN ('X', 'O')) THEN
        RAISE EXCEPTION
            'Cannot add tic-tac-toe symbol constraint: existing rows have a symbol other than X or O.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM moves
        GROUP BY match_id, turn_number
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Cannot add move turn uniqueness: existing rows duplicate (match_id, turn_number). Resolve them explicitly before rerunning this migration.';
    END IF;
END $$;

ALTER TABLE moves ALTER COLUMN idempotency_key SET NOT NULL;
ALTER TABLE moves ALTER COLUMN player_user_id SET NOT NULL;

DO $$
DECLARE
    foreign_key_name text;
BEGIN
    -- Existing databases used ON DELETE SET NULL; replace it with the durable-move policy.
    FOR foreign_key_name IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'moves'::regclass
          AND contype = 'f'
          AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'moves'::regclass AND attname = 'player_user_id')]
          AND confdeltype <> 'r'
    LOOP
        EXECUTE format('ALTER TABLE moves DROP CONSTRAINT %I', foreign_key_name);
    END LOOP;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'moves'::regclass
          AND contype = 'f'
          AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'moves'::regclass AND attname = 'player_user_id')]
    ) THEN
        ALTER TABLE moves
            ADD CONSTRAINT moves_player_user_id_fkey
            FOREIGN KEY (player_user_id) REFERENCES users(id) ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moves_turn_number_positive') THEN
        ALTER TABLE moves ADD CONSTRAINT moves_turn_number_positive CHECK (turn_number > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moves_cell_index_tic_tac_toe') THEN
        ALTER TABLE moves ADD CONSTRAINT moves_cell_index_tic_tac_toe CHECK (cell_index BETWEEN 0 AND 8);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moves_symbol_tic_tac_toe') THEN
        ALTER TABLE moves ADD CONSTRAINT moves_symbol_tic_tac_toe CHECK (symbol IN ('X', 'O'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moves_match_turn_number_unique') THEN
        ALTER TABLE moves ADD CONSTRAINT moves_match_turn_number_unique UNIQUE (match_id, turn_number);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'moves_match_player_idempotency_key_unique') THEN
        ALTER TABLE moves ADD CONSTRAINT moves_match_player_idempotency_key_unique UNIQUE (match_id, player_user_id, idempotency_key);
    END IF;
END $$;

COMMIT;
