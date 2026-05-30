import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { problemsAPI } from '../services/api';
import { useSocket as useSocketContext } from '../context/SocketContext';
import { Terminal as TerminalIcon, Play, Send, Sparkles, Clock, Layers, ShieldCheck, Users, HelpCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '../context/ThemeContext';

export const ProblemWorkspace: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { socket } = useSocketContext();
  const { theme } = useTheme();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  
  // Tabs
  const [leftTab, setLeftTab] = useState<'desc' | 'hints' | 'history'>('desc');
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState<'console' | 'ai'>('console');

  // Compilation state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const [aiReport, setAiReport] = useState<any>(null);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);

  // Room states
  const [roomActive, setRoomActive] = useState(!!roomId);
  const [inputRoomId, setInputRoomId] = useState(roomId || '');
  const [roomUsers, setRoomUsers] = useState<any[]>([]);

  // Editor ref
  const editorRef = useRef<any>(null);

  // Fetch Problem Details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await problemsAPI.get(slug || '');
        setProblem(response.data);
        
        // Select initial code template based on language
        const template = response.data.starterTemplates?.find((t: any) => t.language === selectedLanguage)?.code || '';
        setCode(template);

        // Fetch submissions history
        const histResponse = await problemsAPI.history(response.data.id);
        setSubmissionHistory(histResponse.data);
      } catch (err) {
        console.error('Error fetching problem workspace details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug, selectedLanguage]);

  // Handle Socket Live Syncing
  useEffect(() => {
    if (!socket || !roomId || !problem) return;

    // Join room
    socket.emit('room:join', {
      roomId,
      userId: user?.id || 'guest',
      username: user?.username || 'Guest'
    });

    // Handle initial state sync
    socket.on('room:sync-state', ({ code: roomCode, language, users }: any) => {
      setCode(roomCode);
      setSelectedLanguage(language);
      setRoomUsers(users);
    });

    // Handle code update from other users
    socket.on('room:code-update', (newCode: string) => {
      setCode(newCode);
    });

    // Handle language update from other users
    socket.on('room:language-update', (newLang: string) => {
      setSelectedLanguage(newLang);
    });

    // Handle user joined/left
    socket.on('room:user-joined', ({ users }: any) => {
      setRoomUsers(users);
    });

    socket.on('room:user-left', ({ users }: any) => {
      setRoomUsers(users);
    });

    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('room:sync-state');
      socket.off('room:code-update');
      socket.off('room:language-update');
      socket.off('room:user-joined');
      socket.off('room:user-left');
    };
  }, [socket, roomId, problem, user]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value: string | undefined) => {
    const nextCode = value || '';
    setCode(nextCode);

    // Sync to socket if in collaboration room
    if (socket && roomId) {
      socket.emit('room:code-change', { roomId, code: nextCode });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLang = e.target.value;
    setSelectedLanguage(nextLang);

    // Sync template
    const template = problem?.starterTemplates?.find((t: any) => t.language === nextLang)?.code || '';
    setCode(template);

    if (socket && roomId) {
      socket.emit('room:language-change', { roomId, language: nextLang });
    }
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setConsoleOpen(true);
    setConsoleTab('console');
    setRunResult(null);

    try {
      const response = await problemsAPI.run({
        problemId: problem.id,
        language: selectedLanguage,
        code,
        customInput: customInput || undefined
      });
      setRunResult(response.data);
    } catch (err: any) {
      setRunResult({
        status: 'Runtime Error',
        errorMessage: err.response?.data?.message || 'Server compile connection lost.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setConsoleOpen(true);
    setConsoleTab('ai');
    setRunResult(null);
    setAiReport(null);

    try {
      const response = await problemsAPI.submit({
        problemId: problem.id,
        language: selectedLanguage,
        code
      });
      
      setRunResult(response.data.submission);
      setAiReport(response.data.submission.aiReview);

      // Refresh history
      const histResponse = await problemsAPI.history(problem.id);
      setSubmissionHistory(histResponse.data);
    } catch (err: any) {
      setRunResult({
        status: 'Compile Error',
        errorMessage: err.response?.data?.message || 'Submission connection lost.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoom = () => {
    if (!inputRoomId.trim()) return;
    setSearchParams({ room: inputRoomId });
    setRoomActive(true);
  };

  const handleLeaveRoom = () => {
    setSearchParams({});
    setRoomActive(false);
    setInputRoomId('');
    setRoomUsers([]);
  };

  if (loading || !problem) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-zinc-50 overflow-hidden">
      
      {/* Workspace Sub Header / Controls */}
      <div className="h-11 bg-white border-b border-zinc-200 flex justify-between items-center px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/problems" className="text-zinc-500 hover:text-zinc-700 text-xs font-semibold uppercase tracking-wider">
            Problems
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-800 font-bold text-sm">{problem.title}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
            problem.difficulty === 'Easy' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
            problem.difficulty === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-100' :
            'text-rose-600 bg-rose-50 border-rose-100'
          }`}>
            {problem.difficulty}
          </span>
        </div>

        {/* Action button triggers */}
        <div className="flex items-center gap-2">
          
          {/* Collaboration Tool */}
          <div className="flex items-center gap-1 border-r border-zinc-200 pr-3 mr-1">
            {roomActive ? (
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-zinc-600 font-semibold">{roomUsers.length} active</span>
                <button
                  onClick={handleLeaveRoom}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold px-2 py-0.5 border border-rose-200 hover:border-rose-300 rounded bg-rose-50"
                >
                  Leave
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Room ID..."
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  className="w-20 px-2 py-0.5 text-xs border border-zinc-300 rounded focus:outline-none focus:border-brand-500"
                />
                <button
                  onClick={handleCreateRoom}
                  className="flex items-center gap-1 px-2.5 py-0.5 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-300 hover:border-zinc-400 rounded bg-zinc-50"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1 px-3.5 py-1 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-300 rounded font-medium disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run</span>
          </button>
          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1 px-3.5 py-1 text-xs text-white bg-brand-500 hover:bg-brand-600 rounded font-medium disabled:opacity-50 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Main split canvas */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Descriptions & Details */}
        <div className="w-[40%] border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden select-text">
          
          {/* Tabs header */}
          <div className="flex bg-zinc-50 border-b border-zinc-200 text-xs font-semibold uppercase text-zinc-500">
            <button
              onClick={() => setLeftTab('desc')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                leftTab === 'desc' ? 'border-brand-500 text-brand-500 bg-white' : 'border-transparent hover:bg-zinc-100'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setLeftTab('hints')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                leftTab === 'hints' ? 'border-brand-500 text-brand-500 bg-white' : 'border-transparent hover:bg-zinc-100'
              }`}
            >
              Editorial / Hints
            </button>
            <button
              onClick={() => setLeftTab('history')}
              className={`flex-1 py-2.5 border-b-2 text-center transition-colors ${
                leftTab === 'history' ? 'border-brand-500 text-brand-500 bg-white' : 'border-transparent hover:bg-zinc-100'
              }`}
            >
              History
            </button>
          </div>

          {/* Description Scroll Canvas */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {leftTab === 'desc' && (
              <>
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-zinc-950">{problem.title}</h2>
                  
                  {/* Markdown content */}
                  <div className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line border-b border-zinc-100 pb-5">
                    {problem.description}
                  </div>
                </div>

                {/* Constraints */}
                {problem.constraints?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Constraints:</h3>
                    <ul className="list-disc list-inside text-zinc-600 text-xs font-mono pl-1 space-y-1">
                      {problem.constraints.map((c: string, idx: number) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Examples:</h3>
                  {problem.examples?.map((ex: any, idx: number) => (
                    <div key={idx} className="bg-zinc-50 border border-zinc-200 p-3 rounded text-xs space-y-1.5 font-mono">
                      <div className="text-zinc-500 font-bold uppercase">Example {idx + 1}:</div>
                      <div><span className="text-zinc-400">Input: </span>{ex.input}</div>
                      <div><span className="text-zinc-400">Output: </span>{ex.output}</div>
                      {ex.explanation && <div><span className="text-zinc-400 font-normal">Explanation: </span>{ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Solution Hints:</h3>
                  {problem.hints?.map((h: string, idx: number) => (
                    <div key={idx} className="flex gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded text-xs text-blue-800">
                      <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
                
                {problem.editorial && (
                  <div className="space-y-2 border-t border-zinc-200 pt-4">
                    <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Editorial approach:</h3>
                    <p className="text-zinc-600 text-xs leading-relaxed whitespace-pre-line">{problem.editorial}</p>
                  </div>
                )}
              </div>
            )}

            {leftTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Your Solutions:</h3>
                {submissionHistory.length === 0 ? (
                  <div className="text-center py-10 text-zinc-400 text-xs">
                    No solutions submitted for this problem yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissionHistory.map((s, idx) => (
                      <div key={idx} className="border border-zinc-200 p-3 rounded bg-zinc-50 text-xs space-y-1.5 font-mono">
                        <div className="flex justify-between font-bold">
                          <span className={s.status === 'Accepted' ? 'text-emerald-600' : 'text-rose-600'}>
                            {s.status}
                          </span>
                          <span className="text-zinc-400 text-[10px]">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-zinc-500 text-[10px]">
                          Runtime: {s.executionTime} ms | Memory: {Math.round(s.memoryUsage / 102.4) / 10} MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Monaco IDE Code Space & Console */}
        <div className="w-[60%] flex flex-col h-full bg-white relative">
          
          {/* Header language switcher */}
          <div className="h-10 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center px-4 shrink-0">
            <div className="flex gap-2">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="bg-white border border-zinc-300 rounded text-xs font-semibold py-1 px-2.5 focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div className="text-zinc-400 text-[10px] font-mono">Theme: VS-Light</div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              language={selectedLanguage === 'python' ? 'python' : selectedLanguage === 'cpp' ? 'cpp' : 'javascript'}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                bracketPairColorization: { enabled: true },
                automaticLayout: true
              }}
            />
          </div>

          {/* Collapsible Compiler/AI Console Panel */}
          <div className={`border-t border-zinc-200 bg-white flex flex-col transition-all shrink-0 ${
            consoleOpen ? 'h-[250px]' : 'h-10'
          }`}>
            
            {/* Console Header Bar */}
            <div className="h-10 bg-zinc-50 px-4 border-b border-zinc-200 flex justify-between items-center select-none">
              <div className="flex gap-3">
                <button
                  onClick={() => { setConsoleOpen(true); setConsoleTab('console'); }}
                  className={`text-xs font-bold uppercase tracking-wider py-2.5 border-b-2 flex items-center gap-1.5 ${
                    consoleOpen && consoleTab === 'console' ? 'border-zinc-800 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>Output Console</span>
                </button>
                <button
                  onClick={() => { setConsoleOpen(true); setConsoleTab('ai'); }}
                  className={`text-xs font-bold uppercase tracking-wider py-2.5 border-b-2 flex items-center gap-1.5 ${
                    consoleOpen && consoleTab === 'ai' ? 'border-zinc-800 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>AI Code Audit</span>
                </button>
              </div>

              <button
                onClick={() => setConsoleOpen(!consoleOpen)}
                className="text-xs text-zinc-500 hover:text-zinc-700 font-semibold px-2 py-0.5 border border-zinc-300 bg-white rounded hover:bg-zinc-50"
              >
                {consoleOpen ? 'Collapse' : 'Expand Console'}
              </button>
            </div>

            {/* Console Tabs Body */}
            {consoleOpen && (
              <div className="flex-1 min-h-0 bg-zinc-900 text-zinc-200 p-4 font-mono text-xs overflow-y-auto selection:bg-zinc-800 selection:text-white">
                
                {consoleTab === 'console' && (
                  <div className="space-y-3">
                    {isRunning ? (
                      <div className="text-zinc-400 animate-pulse">Running compilation tests inside sandbox...</div>
                    ) : runResult ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
                          <span className="text-zinc-400">Verdict:</span>
                          <span className={`font-bold ${runResult.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {runResult.status}
                          </span>
                        </div>
                        {runResult.errorMessage ? (
                          <div className="text-rose-400 whitespace-pre-wrap">{runResult.errorMessage}</div>
                        ) : (
                          <>
                            <div className="flex gap-4 text-zinc-400 text-[10px]">
                              <div>CPU: {runResult.executionTime} ms</div>
                              <div>RAM: {Math.round(runResult.memoryUsage / 10.24) / 100} MB</div>
                            </div>
                            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 mt-2 space-y-1">
                              <div className="text-zinc-500 text-[10px] font-bold">STDOUT OUTPUT:</div>
                              <div className="text-zinc-300 font-semibold">{runResult.output || 'No output printed.'}</div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-zinc-500">Console is idle. Write code, specify input, and click "Run" to test.</div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Custom test input params (optional):</div>
                          <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. 2 7 11 15\n9"
                            rows={2}
                            className="w-full bg-zinc-950 text-zinc-300 p-2.5 rounded border border-zinc-800 focus:outline-none focus:border-zinc-700 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {consoleTab === 'ai' && (
                  <div className="space-y-3">
                    {isSubmitting ? (
                      <div className="text-zinc-400 animate-pulse flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-400 animate-spin" />
                        <span>Submitting to judge and scanning with AI evaluator...</span>
                      </div>
                    ) : aiReport ? (
                      <div className="space-y-4 font-sans text-xs">
                        
                        {/* Summary Score Card */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-brand-500 flex items-center justify-center font-bold text-lg text-brand-400 bg-zinc-900">
                              {aiReport.qualityScore}
                            </div>
                            <div>
                              <div className="text-zinc-200 font-bold">AI Quality Score</div>
                              <div className="text-[10px] text-zinc-500">Evaluation calculated post submission</div>
                            </div>
                          </div>

                          <div className="flex gap-4 sm:ml-auto border-t sm:border-t-0 sm:border-l border-zinc-800 pt-3 sm:pt-0 sm:pl-4">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-zinc-500" />
                              <div>
                                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Time Comp.</div>
                                <div className="text-zinc-200 font-bold font-mono">{aiReport.timeComplexity}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-zinc-500" />
                              <div>
                                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Space Comp.</div>
                                <div className="text-zinc-200 font-bold font-mono">{aiReport.spaceComplexity}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bugs Detection */}
                        <div className="space-y-1.5">
                          <div className="text-xs uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-rose-500" />
                            <span>Bugs / Safety Analysis:</span>
                          </div>
                          <ul className="list-disc list-inside text-zinc-300 space-y-1 pl-1">
                            {aiReport.bugs?.map((b: string, idx: number) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Optimizations */}
                        <div className="space-y-1.5">
                          <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">Improvement Suggestions:</div>
                          <ul className="list-disc list-inside text-zinc-300 space-y-1 pl-1">
                            {aiReport.optimizations?.map((o: string, idx: number) => (
                              <li key={idx}>{o}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Style Review */}
                        <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-zinc-400 text-xs">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">CodeStyle & Architecture Feedback:</div>
                          <p>{aiReport.suggestions}</p>
                        </div>

                      </div>
                    ) : (
                      <div className="text-zinc-500 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-zinc-600" />
                        <span>AI Reviewer is waiting. Submit your solution to perform space-time complexity analysis.</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
