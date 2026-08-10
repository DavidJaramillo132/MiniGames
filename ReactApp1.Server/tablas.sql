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

-- Generic durable actions for games whose rules are not tic-tac-toe cells/symbols.
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

-- Answers remain server-side; state DTOs never include correct_option_index.
CREATE TABLE IF NOT EXISTS quiz_questions (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	category text NOT NULL,
	question text NOT NULL UNIQUE,
	options jsonb NOT NULL,
	correct_option_index int NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
	created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO quiz_questions (category, question, options, correct_option_index) VALUES
('History','Which civilization built Machu Picchu?','["Maya","Inca","Roman","Egyptian"]',1),
('History','In which year did the Berlin Wall fall?','["1987","1989","1991","1993"]',1),
('History','Who was the first president of the United States?','["Thomas Jefferson","George Washington","John Adams","Abraham Lincoln"]',1),
('History','The Rosetta Stone helped decode which writing system?','["Cuneiform","Hieroglyphs","Runes","Latin"]',1),
('History','Which empire was ruled by Mansa Musa?','["Mali","Ottoman","Mughal","Byzantine"]',0),
('History','The Renaissance began in which country?','["France","Italy","Spain","Germany"]',1),
('History','Which ship carried Charles Darwin on his famous voyage?','["Endeavour","Beagle","Victory","Mayflower"]',1),
('History','Who wrote the Declaration of Independence?','["Benjamin Franklin","Thomas Jefferson","James Madison","Alexander Hamilton"]',1),
('History','What was the ancient Greek marketplace called?','["Forum","Agora","Acropolis","Pantheon"]',1),
('History','The Cold War was mainly between the US and which country?','["China","Soviet Union","Japan","Germany"]',1),
('Science','What is the chemical symbol for gold?','["Ag","Au","Gd","Go"]',1),
('Science','Which planet is known for its prominent rings?','["Mars","Saturn","Venus","Neptune"]',1),
('Science','What gas do plants absorb from the atmosphere?','["Oxygen","Nitrogen","Carbon dioxide","Helium"]',2),
('Science','How many bones are in the typical adult human body?','["186","206","226","246"]',1),
('Science','What is the largest organ in the human body?','["Liver","Skin","Heart","Lung"]',1),
('Science','What force keeps planets in orbit?','["Magnetism","Gravity","Friction","Electricity"]',1),
('Science','What is the pH of pure water at room temperature?','["5","6","7","8"]',2),
('Science','Which particle has a negative electric charge?','["Proton","Neutron","Electron","Photon"]',2),
('Science','What is the hardest natural substance?','["Quartz","Diamond","Iron","Granite"]',1),
('Science','DNA is primarily found in which part of a cell?','["Nucleus","Membrane","Ribosome","Vacuole"]',0),
('Geography','What is the longest river in South America?','["Nile","Amazon","Parana","Orinoco"]',1),
('Geography','Which country has the most natural lakes?','["Canada","Brazil","Russia","United States"]',0),
('Geography','What is the capital of Australia?','["Sydney","Melbourne","Canberra","Perth"]',2),
('Geography','Mount Kilimanjaro is in which country?','["Kenya","Tanzania","Ethiopia","Uganda"]',1),
('Geography','Which ocean lies between Africa and Australia?','["Atlantic","Arctic","Indian","Pacific"]',2),
('Geography','What is the smallest continent by land area?','["Europe","Antarctica","Australia","South America"]',2),
('Geography','Which desert covers much of northern Africa?','["Gobi","Sahara","Kalahari","Atacama"]',1),
('Geography','Which country is home to the city of Kyoto?','["China","South Korea","Japan","Thailand"]',2),
('Geography','What is the capital of Canada?','["Toronto","Vancouver","Ottawa","Montreal"]',2),
('Geography','The Strait of Gibraltar separates Spain from which country?','["Italy","Morocco","Greece","Turkey"]',1),
('Entertainment','Which film features the line "May the Force be with you"?','["Star Wars","Star Trek","Dune","Alien"]',0),
('Entertainment','Who created the character Sherlock Holmes?','["Agatha Christie","Arthur Conan Doyle","J. K. Rowling","Mark Twain"]',1),
('Entertainment','Which instrument has 88 keys?','["Violin","Piano","Guitar","Flute"]',1),
('Entertainment','What is the fictional African country in Black Panther?','["Genovia","Wakanda","Latveria","Narnia"]',1),
('Entertainment','Which animated film features a clownfish named Marlin?','["Moana","Finding Nemo","Coco","Up"]',1),
('Entertainment','Who painted The Starry Night?','["Claude Monet","Vincent van Gogh","Pablo Picasso","Salvador Dali"]',1),
('Entertainment','Which series is set in the town of Hawkins?','["Dark","Stranger Things","Wednesday","Lost"]',1),
('Entertainment','What is the name of the wizarding school in Harry Potter?','["Hogwarts","Narnia","Camelot","Xavier Institute"]',0),
('Entertainment','Which band recorded "Bohemian Rhapsody"?','["The Beatles","Queen","ABBA","U2"]',1),
('Entertainment','Which game franchise features the character Link?','["Final Fantasy","The Legend of Zelda","Pokemon","Minecraft"]',1)
ON CONFLICT (question) DO NOTHING;

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
