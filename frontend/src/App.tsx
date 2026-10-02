import React, { useEffect, useState, useRef } from 'react';
import './index.css';
import { checkHealth, createPlayer, submitResult, uploadScreenshot, getLeaderboard, getPlayerHistory, type Player, type PreviewResult, type LeaderboardEntry } from './services/api';

function App() {
  const [status, setStatus] = useState<string>('Checking...');
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'leaderboard' | 'profile'>('upload');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [historyData, setHistoryData] = useState<any>(null);
  
  const [nameInput, setNameInput] = useState<string>('');
  
  const [attempts, setAttempts] = useState<string>('3');
  const [solved, setSolved] = useState<boolean>(true);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLeaderboard = async () => {
    const data = await getLeaderboard();
    setLeaderboard(data);
  };

  const fetchHistory = async () => {
    if (player) {
      const data = await getPlayerHistory(player.id);
      setHistoryData(data);
    }
  };

  useEffect(() => {
    checkHealth().then((isOk) => {
      setStatus(isOk ? 'Online' : 'Offline');
    });

    try {
      const storedPlayer = localStorage.getItem('player');
      if (storedPlayer) {
        setPlayer(JSON.parse(storedPlayer));
      }
    } catch (e) {
      console.warn("Could not load player from localStorage", e);
    }
    
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else if (activeTab === 'profile') {
      fetchHistory();
    }
  }, [activeTab, player]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const newPlayer = await createPlayer(nameInput.trim());
    if (newPlayer) {
      setPlayer(newPlayer);
      try {
        localStorage.setItem('player', JSON.stringify(newPlayer));
      } catch (err) {}
    } else {
      alert("Registration failed. Please try again.");
    }
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    try {
      const result = await submitResult({
        player_id: player.id,
        attempts: Number(attempts),
        solved: solved
      });
      alert(`Submission successful! You scored ${result.score} points.`);
      setPreviewResult(null); // clear preview after submission
      setUploadMessage('');
      setActiveTab('leaderboard'); // auto switch to leaderboard to see score!
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleFile = async (file: File) => {
    setUploadMessage('Uploading & Parsing...');
    setPreviewResult(null);
    try {
      const result = await uploadScreenshot(file);
      setPreviewResult(result);
      setUploadMessage(result.message || 'Screenshot parsed successfully!');
      
      // Auto-fill form
      if (result.attempts) setAttempts(result.attempts.toString());
      setSolved(result.solved);
    } catch (err: any) {
      setUploadMessage('Error: ' + err.message);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Helper to render Wordle grid colors
  const getColorClass = (color: string) => {
    if (color === 'green') return 'bg-green-500 border-green-500';
    if (color === 'yellow') return 'bg-yellow-500 border-yellow-500';
    return 'bg-gray-500 border-gray-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Wordle League</h1>
        <p className="text-sm text-gray-600 mb-6">
          Backend: <span className={`font-semibold ${status === 'Online' ? 'text-green-600' : 'text-red-600'}`}>{status}</span>
        </p>

        {player ? (
          <div className="text-left">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl text-gray-800 font-semibold">Welcome, {player.name}!</h2>
              <button 
                onClick={() => {
                  localStorage.removeItem('player');
                  setPlayer(null);
                  setActiveTab('upload');
                }}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Switch User
              </button>
            </div>
            
            <div className="flex border-b mb-6">
              <button 
                className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
              <button 
                className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'leaderboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                Leaderboard
              </button>
              <button 
                className={`flex-1 py-2 text-center text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
            </div>

            {activeTab === 'upload' && (
              <>
                <p className="text-gray-500 text-sm mb-6">Submit your daily Wordle result.</p>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <h3 className="font-medium text-gray-700 mb-2">Upload your Wordle result</h3>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm mb-2 pointer-events-none">
                    Choose Screenshot
                  </button>
                  <p className="text-xs text-gray-500">or drag & drop</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                
                {uploadMessage && (
                  <div className={`mb-4 text-center text-sm font-medium ${previewResult && previewResult.valid === false ? 'text-orange-600' : 'text-blue-600'}`}>
                    {uploadMessage}
                  </div>
                )}

                {previewResult && previewResult.grid && (
                  <div className={`mb-6 flex flex-col items-center gap-1 p-4 rounded-lg border ${previewResult.valid === false ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}>
                    <p className="text-sm font-semibold mb-2">Parsed Grid Preview</p>
                    {previewResult.grid.map((row, i) => (
                      <div key={i} className="flex gap-1">
                        {row.map((cell, j) => (
                          <div key={j} className={`w-8 h-8 rounded-sm border ${getColorClass(cell)}`} />
                        ))}
                      </div>
                    ))}
                    <div className="flex flex-col items-center mt-2">
                      <p className="text-xs text-gray-500 font-medium">Confidence: {(previewResult.confidence * 100).toFixed(0)}%</p>
                      {previewResult.valid === false && (
                        <p className="text-xs text-orange-600 font-semibold mt-1">Check manual inputs, grid appears invalid!</p>
                      )}
                    </div>
                  </div>
                )}
                
                <p className="text-gray-500 text-xs text-center mb-4">- EDIT EXTRACTED DATA -</p>

                <form onSubmit={handleSubmission} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attempts</label>
                    <select 
                      value={attempts} 
                      onChange={(e) => setAttempts(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={!solved}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="solved" 
                      checked={solved} 
                      onChange={(e) => {
                        setSolved(e.target.checked);
                        if (!e.target.checked) setAttempts('6');
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="solved" className="text-sm font-medium text-gray-700">Solved</label>
                  </div>

                  <button 
                    type="submit" 
                    className="mt-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
                  >
                    Submit Result
                  </button>
                </form>
              </>
            )}

            {activeTab === 'leaderboard' && (
              <div className="flex flex-col gap-3">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No submissions yet today!</p>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    {leaderboard.map((entry) => (
                      <div key={entry.rank} className="flex items-center justify-between p-3 border-b last:border-0 bg-white hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <span className={`font-bold w-6 text-center ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                            #{entry.rank}
                          </span>
                          <span className="font-medium text-gray-800">{entry.player}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-blue-600">{entry.score} pts</span>
                          <span className="text-xs text-gray-500">{entry.solved ? `${entry.attempts}/6` : 'Failed'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && historyData && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Score</p>
                    <p className="text-2xl font-bold text-blue-600">{historyData.metrics.total_score}</p>
                  </div>
                  <div className="text-center border-l">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Games Played</p>
                    <p className="text-2xl font-bold text-gray-800">{historyData.metrics.games_played}</p>
                  </div>
                  <div className="text-center border-t pt-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Win Rate</p>
                    <p className="text-xl font-bold text-green-600">{historyData.metrics.games_played > 0 ? Math.round((historyData.metrics.wins / historyData.metrics.games_played) * 100) : 0}%</p>
                  </div>
                  <div className="text-center border-t border-l pt-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg Attempts</p>
                    <p className="text-xl font-bold text-gray-800">{historyData.metrics.average_attempts}</p>
                  </div>
                  <div className="text-center border-t pt-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Current Streak</p>
                    <p className="text-xl font-bold text-amber-500">{historyData.metrics.current_streak}</p>
                  </div>
                  <div className="text-center border-t border-l pt-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Best Streak</p>
                    <p className="text-xl font-bold text-amber-500">{historyData.metrics.best_streak}</p>
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 px-1">Recent Submissions</h3>
                  {historyData.history.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 border rounded-md">No games played yet.</p>
                  ) : (
                    <div className="border rounded-md overflow-hidden bg-white divide-y">
                      {historyData.history.map((sub: any) => (
                        <div key={sub.id} className="flex justify-between p-3 items-center">
                          <span className="font-medium text-gray-700">Puzzle #{sub.puzzle_number}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-blue-600">+{sub.score}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${sub.solved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {sub.solved ? `${sub.attempts}/6` : 'X/6'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Register & Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;

