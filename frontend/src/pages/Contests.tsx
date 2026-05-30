import React, { useEffect, useState } from 'react';
import { contestsAPI } from '../services/api';
import { Trophy, Clock, UserCheck, BarChart2 } from 'lucide-react';

export const Contests: React.FC = () => {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [joinMsg, setJoinMsg] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await contestsAPI.list();
        setContests(response.data);
        if (response.data.length > 0) {
          setSelectedContest(response.data[0]);
          fetchLeaderboard(response.data[0].id || response.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching contests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const fetchLeaderboard = async (id: string) => {
    try {
      const response = await contestsAPI.leaderboard(id);
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Error fetching contest leaderboard:', err);
    }
  };

  const handleSelectContest = (c: any) => {
    setSelectedContest(c);
    fetchLeaderboard(c.id || c._id);
    setJoinMsg('');
  };

  const handleJoin = async () => {
    if (!selectedContest) return;
    const cid = selectedContest.id || selectedContest._id;
    try {
      await contestsAPI.join(cid);
      setJoinMsg('Successfully joined the contest! Solve the catalog questions when it commences.');
      
      // Refresh leaderboard list
      fetchLeaderboard(cid);
    } catch (err: any) {
      setJoinMsg(err.response?.data?.message || 'Failed to join. Already registered.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-brand-500 fill-brand-50" />
          <span>Competitive Programming Contests</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Compete in weekly algorithmic challenges, solve problems in real-time, and boost your developer ranking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contests List */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active & Upcoming</h2>
          {contests.length === 0 ? (
            <div className="bg-white border border-zinc-200 p-6 text-center text-zinc-400 rounded-lg text-sm">
              No contests scheduled. Check back later!
            </div>
          ) : (
            <div className="space-y-3">
              {contests.map((c) => (
                <button
                  key={c.id || c._id}
                  onClick={() => handleSelectContest(c)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedContest?._id === c._id || selectedContest?.id === c.id
                      ? 'bg-white border-brand-500 shadow-sm ring-1 ring-brand-500'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-sm font-bold text-zinc-800">{c.title}</div>
                  <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2">{c.description}</p>
                  
                  <div className="flex gap-4 mt-3 text-[10px] text-zinc-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(c.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>{c.problems?.length || 3} Tasks</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Contest details & Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          {selectedContest ? (
            <>
              {/* Detail pane */}
              <div className="bg-white border border-zinc-200 p-6 rounded-lg space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">{selectedContest.title}</h2>
                    <p className="text-zinc-600 text-sm mt-1">{selectedContest.description}</p>
                  </div>
                  <button
                    onClick={handleJoin}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Register / Join</span>
                  </button>
                </div>

                {joinMsg && (
                  <div className="p-3 bg-blue-50 text-blue-800 border border-blue-100 rounded text-xs">
                    {joinMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs border-t border-zinc-100">
                  <div>
                    <div className="text-zinc-400">Start Time:</div>
                    <div className="font-semibold text-zinc-700">{new Date(selectedContest.startTime).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">End Time:</div>
                    <div className="font-semibold text-zinc-700">{new Date(selectedContest.endTime).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Tasks:</div>
                    <div className="font-semibold text-zinc-700">{selectedContest.problems?.length || 3} Coding Tasks</div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Live Rankings Leaderboard</h3>
                </div>

                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 text-sm">
                    No ratings submissions logged. Register and code solutions to populate standings.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200 text-sm text-left">
                      <thead className="bg-zinc-50 text-zinc-500 font-medium">
                        <tr>
                          <th className="px-6 py-3 w-16 text-center">Rank</th>
                          <th className="px-6 py-3">Username</th>
                          <th className="px-6 py-3">Solved Score</th>
                          <th className="px-6 py-3 text-right">Time Taken</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-700 font-mono text-xs">
                        {leaderboard.map((u, i) => (
                          <tr key={i} className="hover:bg-zinc-50">
                            <td className="px-6 py-3 text-center font-bold text-zinc-500">
                              {u.rank}
                            </td>
                            <td className="px-6 py-3 font-sans text-sm font-semibold text-zinc-800">
                              {u.username}
                            </td>
                            <td className="px-6 py-3 text-zinc-600 font-semibold">
                              {u.score} pts
                            </td>
                            <td className="px-6 py-3 text-right text-zinc-400">
                              {u.timeTaken} mins
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-zinc-200 p-12 text-center text-zinc-400 rounded-lg">
              Select a contest from the list to view leaderboards and register.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
