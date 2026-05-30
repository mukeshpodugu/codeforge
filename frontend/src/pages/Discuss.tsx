import React, { useEffect, useState } from 'react';
import { discussAPI } from '../services/api';
import { MessageSquare, ThumbsUp, ThumbsDown, Send, Filter, Plus, X } from 'lucide-react';

export const Discuss: React.FC = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeThread, setActiveThread] = useState<any>(null);
  
  // Comment & Post Inputs
  const [commentContent, setCommentContent] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postAlert, setPostAlert] = useState('');

  const categories = ['All', 'General', 'Problems', 'Interviews', 'Contests', 'Feedback'];

  useEffect(() => {
    fetchThreads();
  }, [selectedCategory]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const catParam = selectedCategory === 'All' ? undefined : selectedCategory;
      const response = await discussAPI.list(catParam);
      setThreads(response.data);
    } catch (err) {
      console.error('Error fetching forum discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = async (id: string) => {
    try {
      const response = await discussAPI.get(id);
      setActiveThread(response.data);
    } catch (err) {
      console.error('Error fetching thread details:', err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !activeThread) return;

    try {
      const tid = activeThread.id || activeThread._id;
      const response = await discussAPI.comment(tid, commentContent);
      setActiveThread({ ...activeThread, comments: response.data });
      setCommentContent('');
    } catch (err) {
      console.error('Error commenting on thread:', err);
    }
  };

  const handleVote = async (id: string, type: 'upvote' | 'downvote') => {
    try {
      const response = await discussAPI.vote(id, type);
      
      // Update local state for thread details
      if (activeThread && (activeThread.id === id || activeThread._id === id)) {
        setActiveThread({
          ...activeThread,
          reputationPoints: response.data.reputationPoints
        });
      }
      
      // Update thread lists
      setThreads(threads.map(t => {
        if (t.id === id || t._id === id) {
          return { ...t, reputationPoints: response.data.reputationPoints };
        }
        return t;
      }));
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setPostAlert('Title and content are required.');
      return;
    }

    try {
      await discussAPI.create({
        title: newTitle,
        content: newContent,
        category: newCategory
      });
      setNewTitle('');
      setNewContent('');
      setIsCreatingPost(false);
      setPostAlert('');
      fetchThreads(); // Refresh list
    } catch (err) {
      setPostAlert('Failed to submit post.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            <span>Developer Discussions Forum</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Exchange advice, share interview experiences, and discuss coding challenge approaches.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingPost(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Thread</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Span: Category filter & thread list */}
        <div className="space-y-4 lg:col-span-1">
          
          {/* Categories card */}
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Category</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedCategory === c
                      ? 'bg-brand-500 text-white font-semibold'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Threads card list */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Discussion threads</h2>
            {loading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-500 mx-auto"></div>
              </div>
            ) : threads.length === 0 ? (
              <div className="bg-white border border-zinc-200 p-8 text-center text-zinc-400 rounded-lg text-xs">
                No threads found in this category. Be the first to post!
              </div>
            ) : (
              threads.map(t => (
                <button
                  key={t.id || t._id}
                  onClick={() => handleSelectThread(t.id || t._id)}
                  className={`w-full text-left p-4 bg-white border rounded-lg transition-all hover:border-zinc-300 block ${
                    activeThread?._id === t._id || activeThread?.id === t.id
                      ? 'border-brand-500 ring-1 ring-brand-500 shadow-sm'
                      : 'border-zinc-200'
                  }`}
                >
                  <span className="text-[10px] bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-500 uppercase font-semibold">
                    {t.category}
                  </span>
                  <div className="text-xs font-bold text-zinc-800 mt-2 line-clamp-1">{t.title}</div>
                  <div className="flex justify-between items-center mt-3 text-[10px] text-zinc-400">
                    <div>by {t.author?.username || 'Guest'}</div>
                    <div className="flex gap-2">
                      <span>{t.reputationPoints || 0} votes</span>
                      <span>•</span>
                      <span>{t.comments?.length || 0} comments</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

        </div>

        {/* Right Span: Thread View / Post Composer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Post Creator Panel */}
          {isCreatingPost && (
            <div className="bg-white border border-zinc-200 p-6 rounded-lg space-y-4 relative">
              <button
                onClick={() => setIsCreatingPost(false)}
                className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Create New Discussion Thread</h2>
              
              {postAlert && <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-xs">{postAlert}</div>}

              <form onSubmit={handleCreatePost} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Thread Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tips for sorting algorithms"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="block w-full border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="block border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Problems">Problems</option>
                    <option value="Interviews">Interviews</option>
                    <option value="Contests">Contests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Content (Markdown supported)</label>
                  <textarea
                    required
                    placeholder="Write your explanation or query here..."
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="block w-full border border-zinc-300 p-3 rounded text-xs focus:outline-none focus:border-brand-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 rounded font-semibold shadow-sm"
                >
                  Post Thread
                </button>
              </form>
            </div>
          )}

          {/* Active Thread Details & Comment feed */}
          {activeThread ? (
            <div className="space-y-6">
              
              {/* Thread contents */}
              <div className="bg-white border border-zinc-200 p-6 rounded-lg space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-500 uppercase font-semibold">
                      {activeThread.category}
                    </span>
                    <h2 className="text-lg font-bold text-zinc-900 mt-2">{activeThread.title}</h2>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Posted by <span className="font-semibold text-zinc-600">{activeThread.author?.username || 'Guest'}</span> on {new Date(activeThread.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Up/Down Votes */}
                  <div className="flex items-center gap-1.5 border border-zinc-200 px-2 py-1 rounded bg-zinc-50">
                    <button
                      onClick={() => handleVote(activeThread.id || activeThread._id, 'upvote')}
                      className="p-1 hover:bg-zinc-200 rounded text-zinc-500 hover:text-zinc-800"
                      title="Upvote"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-zinc-700">{activeThread.reputationPoints || 0}</span>
                    <button
                      onClick={() => handleVote(activeThread.id || activeThread._id, 'downvote')}
                      className="p-1 hover:bg-zinc-200 rounded text-zinc-500 hover:text-zinc-800"
                      title="Downvote"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed border-t border-zinc-100 pt-4">
                  {activeThread.content}
                </p>
              </div>

              {/* Comments Feed */}
              <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Comments Section</h3>

                {/* Add comment form */}
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="flex-1 border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Comments feed log */}
                {(!activeThread.comments || activeThread.comments.length === 0) ? (
                  <div className="text-center py-6 text-zinc-400 text-xs">
                    No comments posted yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeThread.comments.map((comment: any, index: number) => (
                      <div key={index} className="bg-zinc-50 p-3.5 rounded border border-zinc-200 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400">
                          <span className="font-semibold text-zinc-600">{comment.author?.username || 'Guest'}</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-zinc-700 whitespace-pre-line">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-zinc-200 p-12 text-center text-zinc-400 rounded-lg">
              Select a thread from the catalog list to read conversations, vote, and write replies.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
