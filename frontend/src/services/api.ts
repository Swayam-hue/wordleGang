const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Player {
  id: string;
  name: string;
  group_id?: string;
}

export interface Submission {
  player_id: string;
  attempts: number;
  solved: boolean;
  group_id?: string;
}

export interface PreviewResult {
  attempts: number;
  solved: boolean;
  grid: string[][];
  confidence: number;
  message?: string;
  valid?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  attempts: number;
  solved: boolean;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/leaderboard/today`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const getPlayerHistory = async (playerId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}/history`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching player history:', error);
    return null;
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const createPlayer = async (name: string): Promise<Player | null> => {
  try {
    const response = await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error creating player:', error);
    return null;
  }
};

export const submitResult = async (submission: Submission): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    if (response.ok) {
      return await response.json();
    }
    const err = await response.json();
    throw new Error(err.detail || 'Failed to submit');
  } catch (error: any) {
    console.error('Error submitting:', error);
    throw error;
  }
};

export const uploadScreenshot = async (file: File): Promise<PreviewResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/submissions/preview`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to upload screenshot');
  }
  
  return await response.json();
};
