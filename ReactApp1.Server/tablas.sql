-- PostgreSQL schema for PlayHub (ReactApp1)
-- Run this file with psql or via migrations to create the required tables

-- Requirements: enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Room status enum
DO $$ BEGIN
		IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status') THEN
				CREATE TYPE room_status AS ENUM ('waiting', 'in_game', 'finished', 'closed');
		END IF;
END$$;

-- Users (optional: integrate with your auth provider)
CREATE TABLE IF NOT EXISTS users (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	username text NOT NULL UNIQUE,
	password_hash text NOT NULL, 
	email text UNIQUE,
	display_name text,
	created_at timestamptz NOT NULL DEFAULT now()
);

-- Games catalog (tic-tac-toe, batalla-naval, ...)
CREATE TABLE IF NOT EXISTS games (
	slug text PRIMARY KEY,
	name text NOT NULL,
	is_enabled boolean NOT NULL DEFAULT true,
	max_players int NOT NULL DEFAULT 2,
	created_at timestamptz NOT NULL DEFAULT now()
);

-- Rooms: active game lobbies / match rooms
CREATE TABLE IF NOT EXISTS rooms (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	game_slug text NOT NULL REFERENCES games(slug) ON DELETE CASCADE,
	name text NOT NULL,
	room_code text NOT NULL UNIQUE, -- human-friendly identifier / slug
	status room_status NOT NULL DEFAULT 'waiting',
	capacity int NOT NULL DEFAULT 2,
	current_players int NOT NULL DEFAULT 0,
	creator_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	closed_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_rooms_game_status ON rooms(game_slug, status);
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON rooms(room_code);

-- Room players: one row per join. Use this table to compute live players.
CREATE TABLE IF NOT EXISTS room_players (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
	user_id uuid REFERENCES users(id) ON DELETE SET NULL,
	connection_id text, -- SignalR connection id (transient)
	is_host boolean NOT NULL DEFAULT false,
	joined_at timestamptz NOT NULL DEFAULT now(),
	left_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_roomplayers_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_roomplayers_user ON room_players(user_id);

-- Matches: persisted match records (history)
CREATE TABLE IF NOT EXISTS matches (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
	started_at timestamptz NOT NULL DEFAULT now(),
	ended_at timestamptz NULL,
	winner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
	result jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_matches_room ON matches(room_id);

-- Moves: per-turn moves for a match
CREATE TABLE IF NOT EXISTS moves (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
	turn_number int NOT NULL CHECK (turn_number > 0),
	player_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
	idempotency_key uuid NOT NULL,
	cell_index int NOT NULL CHECK (cell_index BETWEEN 0 AND 8),
	symbol char(1) NOT NULL CHECK (symbol IN ('X', 'O')),
	created_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT moves_match_turn_number_unique UNIQUE (match_id, turn_number),
	CONSTRAINT moves_match_player_idempotency_key_unique UNIQUE (match_id, player_user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_moves_match ON moves(match_id);

-- Player stats / leaderboard
CREATE TABLE IF NOT EXISTS player_stats (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	game_slug text NOT NULL REFERENCES games(slug) ON DELETE CASCADE,
	wins int NOT NULL DEFAULT 0,
	losses int NOT NULL DEFAULT 0,
	draws int NOT NULL DEFAULT 0,
	elo int NOT NULL DEFAULT 1500,
	updated_at timestamptz NOT NULL DEFAULT now(),
	UNIQUE(user_id, game_slug)
);

-- Utility: function to mark room updated_at automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rooms_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Optional cleanup helper: delete rooms with zero players (call from background job or on disconnect)
-- Example: DELETE FROM rooms WHERE current_players = 0 AND status = 'waiting' AND now() - updated_at > interval '1 minute';

-- Notes:
-- 1) SignalR GameHub should update `room_players` and `rooms.current_players` on join/leave.
-- 2) When `current_players` becomes 0 you can either DELETE the room row or set `status = 'closed'`.
-- 3) Use transactions to keep room/room_players/matches consistent.
