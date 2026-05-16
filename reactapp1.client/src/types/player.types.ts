export interface LeaderboardEntry {
  rank: number;
  username: string;
  elo: number;
  wins: number;
  rankColor?: string;
}

export interface StatTile {
  label: string;
  value: string;
  note: string;
}

export interface PlayerStats {
  gameName: string;
  tiles: StatTile[];
}
