import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateProfileSuccess } from '../features/authSlice';
import { authAPI, problemsAPI } from '../services/api';
import { Flame, CheckCircle, Percent, Trophy, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          authAPI.getProfile(),
          problemsAPI.history()
        ]);
        
        dispatch(updateProfileSuccess(profileRes.data.user));
        setSubmissions(historyRes.data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  const { solvedStats, streak, submissionsCount, acceptedCount, contestRating, submissionCalendar } = user.profile || {
    solvedStats: { easy: 0, medium: 0, hard: 0 },
    streak: 0,
    submissionsCount: 0,
    acceptedCount: 0,
    contestRating: 1500,
    submissionCalendar: {}
  };

  const totalSolved = solvedStats.easy + solvedStats.medium + solvedStats.hard;
  const acceptanceRate = submissionsCount > 0 ? Math.round((acceptedCount / submissionsCount) * 100) : 0;

  // Generate GitHub style Heatmap (Past 14 weeks = 98 days)
  const renderHeatmap = () => {
    const blocks = [];
    const today = new Date();
    
    // Start from 14 weeks ago (Sunday)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 97);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // align to Sunday

    const dateCursor = new Date(startDate);
    
    while (dateCursor <= today) {
      const dateStr = dateCursor.toISOString().split('T')[0];
      const count = submissionCalendar ? (submissionCalendar[dateStr] || 0) : 0;

      // Color mapping
      let color = 'bg-zinc-100 hover:bg-zinc-200';
      if (count > 0 && count <= 2) color = 'bg-blue-100 hover:bg-blue-200 border-blue-200';
      else if (count > 2 && count <= 4) color = 'bg-blue-300 hover:bg-blue-400 border-blue-400';
      else if (count > 4) color = 'bg-blue-600 hover:bg-blue-700 border-blue-700';

      blocks.push({
        date: dateStr,
        count,
        color
      });

      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    return (
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
        {blocks.map((b, i) => (
          <div
            key={i}
            title={`${b.count} submissions on ${b.date}`}
            className={`w-3.5 h-3.5 rounded-sm border border-transparent transition-colors cursor-pointer ${b.color}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-zinc-200 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <span>Welcome back, {user.username}!</span>
            <Sparkles className="w-5 h-5 text-brand-500 fill-brand-100" />
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Let's maintain your daily streak. Solve a problem or submit a mock assessment.
          </p>
        </div>
        <Link
          to="/problems"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors self-start md:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          Solve Challenges
        </Link>
      </div>

      {/* Grid Statistics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-zinc-200 p-5 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-md">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Problems Solved</div>
            <div className="text-2xl font-bold text-zinc-800">{totalSolved}</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-zinc-200 p-5 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-md">
            <Flame className="w-6 h-6 fill-amber-100" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Active Streak</div>
            <div className="text-2xl font-bold text-zinc-800">{streak} Days</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-zinc-200 p-5 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Acceptance Rate</div>
            <div className="text-2xl font-bold text-zinc-800">{acceptanceRate}%</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-zinc-200 p-5 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-md">
            <Trophy className="w-6 h-6 fill-purple-100" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Contest Rating</div>
            <div className="text-2xl font-bold text-zinc-800">{contestRating}</div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Span: Heatmap & Solved breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Heatmap Card */}
          <div className="bg-white border border-zinc-200 p-6 rounded-lg">
            <h2 className="text-sm font-semibold text-zinc-800 mb-4 uppercase tracking-wider">
              Submission Heatmap (Past 14 Weeks)
            </h2>
            <div className="overflow-x-auto">
              {renderHeatmap()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-3 justify-end select-none">
              <span>Less</span>
              <div className="w-3.5 h-3.5 rounded-sm bg-zinc-100" />
              <div className="w-3.5 h-3.5 rounded-sm bg-blue-100 border border-blue-200" />
              <div className="w-3.5 h-3.5 rounded-sm bg-blue-300 border border-blue-400" />
              <div className="w-3.5 h-3.5 rounded-sm bg-blue-600 border border-blue-700" />
              <span>More</span>
            </div>
          </div>

          {/* Recent Submissions Table */}
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">
                Recent Submissions History
              </h2>
            </div>

            {submissions.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-sm">
                No submissions logged yet. Start coding to compile metrics!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-50 font-medium text-zinc-500 text-left">
                    <tr>
                      <th className="px-6 py-3">Language</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Runtime</th>
                      <th className="px-6 py-3">Memory</th>
                      <th className="px-6 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {submissions.slice(0, 5).map((sub, i) => (
                      <tr key={i} className="hover:bg-zinc-50">
                        <td className="px-6 py-3 font-mono text-xs uppercase text-zinc-500">
                          {sub.language}
                        </td>
                        <td className="px-6 py-3 font-semibold">
                          <span
                            className={
                              sub.status === 'Accepted'
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-zinc-500 font-mono text-xs">
                          {sub.executionTime} ms
                        </td>
                        <td className="px-6 py-3 text-zinc-500 font-mono text-xs">
                          {Math.round(sub.memoryUsage / 102.4) / 10} MB
                        </td>
                        <td className="px-6 py-3 text-right text-zinc-400 text-xs">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Span: Solved Breakdown Progress */}
        <div className="bg-white border border-zinc-200 p-6 rounded-lg h-fit space-y-6">
          <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">
            Solved Breakdown
          </h2>

          <div className="space-y-4 pt-2">
            
            {/* Easy */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-emerald-600 font-semibold">Easy</span>
                <span className="text-zinc-500 font-mono">{solvedStats.easy} solved</span>
              </div>
              <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (solvedStats.easy / 15) * 100)}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-amber-600 font-semibold">Medium</span>
                <span className="text-zinc-500 font-mono">{solvedStats.medium} solved</span>
              </div>
              <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (solvedStats.medium / 15) * 100)}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-rose-600 font-semibold">Hard</span>
                <span className="text-zinc-500 font-mono">{solvedStats.hard} solved</span>
              </div>
              <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (solvedStats.hard / 15) * 100)}%` }}
                />
              </div>
            </div>

          </div>

          <div className="border-t border-zinc-200 pt-4 flex justify-between text-center">
            <div className="flex-1 border-r border-zinc-100">
              <div className="text-2xl font-bold text-zinc-800">{acceptedCount}</div>
              <div className="text-xs text-zinc-400">Accepted Runs</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-zinc-800">{submissionsCount}</div>
              <div className="text-xs text-zinc-400">Total Submits</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
