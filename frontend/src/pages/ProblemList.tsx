import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../services/api';
import { BookOpen, Search, CheckCircle, HelpCircle } from 'lucide-react';

export const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const categories = ['All', 'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Sorting', 'Searching'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await problemsAPI.list();
        setProblems(response.data);
      } catch (err) {
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    return matchSearch && matchCategory && matchDiff;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Hard': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <span>Problem Catalog</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Browse coding challenges, verify logic algorithms, and see your solutions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search problem title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-1.5 border border-zinc-300 rounded text-sm placeholder-zinc-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Filters Catalog */}
      <div className="flex flex-col gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
        
        {/* Category Tabs */}
        <div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category</div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white border-transparent'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Tabs */}
        <div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Difficulty</div>
          <div className="flex gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3.5 py-1 text-xs font-medium rounded border transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-brand-500 text-white border-transparent'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Problems Table */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mx-auto"></div>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="bg-white border border-zinc-200 p-12 text-center text-zinc-400 rounded-lg">
          No problems matched your query filters. Try adjusting categories or difficulty.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-3.5 w-12 text-center">Status</th>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Tags</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-700">
                {filteredProblems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      {prob.acceptedCount > 0 ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-zinc-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-800">
                      <Link to={`/problems/${prob.slug}`} className="hover:text-brand-500 transition-colors">
                        {prob.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {prob.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold select-none ${getDifficultyColor(prob.difficulty)}`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {prob.tags?.map((t: string) => (
                          <span key={t} className="bg-zinc-100 text-zinc-500 text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-zinc-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/problems/${prob.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-brand-500 hover:text-brand-600 border border-brand-200 hover:border-brand-500 px-3 py-1 rounded bg-brand-50/30"
                      >
                        Solve
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
