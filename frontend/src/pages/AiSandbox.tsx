import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import { Cpu, Sparkles, FileText, Send, AlertTriangle, Map } from 'lucide-react';

export const AiSandbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resume' | 'interview' | 'roadmap'>('resume');

  // Resume state
  const [fileName, setFileName] = useState('resume.txt');
  const [skillsText, setSkillsText] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeReport, setResumeReport] = useState<any>(null);

  // Interview state
  const [interviewType, setInterviewType] = useState('Technical');
  const [chatStarted, setChatStarted] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState<number | null>(null);

  // Roadmap state
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [goals, setGoals] = useState('Crack FAANG Software Engineering Interview');
  const [weakTopicInput, setWeakTopicInput] = useState('');
  const [weakTopics, setWeakTopics] = useState<string[]>(['Graphs', 'Dynamic Programming']);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapReport, setRoadmapReport] = useState<any>(null);

  // 1. Evaluate Resume
  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillsText.trim()) return;
    setResumeLoading(true);
    setResumeReport(null);

    try {
      const response = await aiAPI.analyzeResume({
        fileName,
        skillsText,
        experienceText
      });
      setResumeReport(response.data);
    } catch (err) {
      console.error('Error scanning resume:', err);
    } finally {
      setResumeLoading(false);
    }
  };

  // 2. Chat mock interview
  const handleStartChat = async () => {
    setChatStarted(true);
    setChatLoading(true);
    setChatHistory([]);
    setEvaluationScore(null);

    try {
      const response = await aiAPI.chatInterview({
        history: [],
        currentMessage: 'Start interview',
        type: interviewType
      });
      setChatHistory([{ role: 'assistant', content: response.data.response }]);
    } catch (err) {
      console.error('Error launching interview chat:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || chatLoading) return;

    const userMessage = inputMsg;
    setInputMsg('');
    const updatedHistory = [...chatHistory, { role: 'user' as const, content: userMessage }];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    try {
      const response = await aiAPI.chatInterview({
        history: updatedHistory,
        currentMessage: userMessage,
        type: interviewType
      });
      setChatHistory([...updatedHistory, { role: 'assistant' as const, content: response.data.response }]);
      setEvaluationScore(response.data.score);
    } catch (err) {
      console.error('Error exchanging interview chats:', err);
    } finally {
      setChatLoading(false);
    }
  };

  // 3. Roadmap generation
  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoadmapLoading(true);
    setRoadmapReport(null);

    try {
      const response = await aiAPI.generateRoadmap({
        skillLevel,
        goals,
        weakTopics
      });
      setRoadmapReport(response.data);
    } catch (err) {
      console.error('Error generating roadmap:', err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const addWeakTopic = () => {
    if (weakTopicInput.trim() && !weakTopics.includes(weakTopicInput.trim())) {
      setWeakTopics([...weakTopics, weakTopicInput.trim()]);
      setWeakTopicInput('');
    }
  };

  const removeWeakTopic = (topic: string) => {
    setWeakTopics(weakTopics.filter(t => t !== topic));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-500" />
          <span>AI Preparation Sandbox</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Utilize deep cognitive models to test resumes, perform mock behavioral/technical interviews, and chart roadmaps.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-200 text-sm font-semibold uppercase text-zinc-500 bg-white rounded-t-lg overflow-hidden">
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex-1 py-3 border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'resume' ? 'border-brand-500 text-brand-500 bg-zinc-50/50' : 'border-transparent hover:bg-zinc-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ATS Resume Analyzer</span>
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex-1 py-3 border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'interview' ? 'border-brand-500 text-brand-500 bg-zinc-50/50' : 'border-transparent hover:bg-zinc-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>AI Interview Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex-1 py-3 border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'roadmap' ? 'border-brand-500 text-brand-500 bg-zinc-50/50' : 'border-transparent hover:bg-zinc-50'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Study Roadmap Generator</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-zinc-200 border-t-0 p-6 rounded-b-lg select-text">
        
        {/* TAB 1: RESUME SCORER */}
        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Input Form */}
            <form onSubmit={handleAnalyzeResume} className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Paste Resume Details</h2>
              <p className="text-xs text-zinc-400">Specify skills text catalog and experience summaries to score against corporate ATS filters.</p>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Resume File Name:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="block w-full border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Skills List (comma separated):</label>
                <textarea
                  required
                  placeholder="e.g. React.js, Node.js, TypeScript, Docker, SQL, AWS, Python"
                  rows={3}
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="block w-full border border-zinc-300 p-2.5 rounded text-xs focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Job Experience Summaries:</label>
                <textarea
                  placeholder="e.g. Worked 2 years at Software Solutions. Optimized query pipelines and created dashboard components."
                  rows={4}
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  className="block w-full border border-zinc-300 p-2.5 rounded text-xs focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={resumeLoading}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded shadow-sm disabled:opacity-50"
              >
                {resumeLoading ? 'Evaluating with AI...' : 'Scan ATS Score'}
              </button>
            </form>

            {/* Results pane */}
            <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 h-fit space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Scan Evaluation Report</h2>
              
              {resumeLoading ? (
                <div className="py-12 text-center text-zinc-400 animate-pulse text-xs">AI scanning algorithms running...</div>
              ) : resumeReport ? (
                <div className="space-y-4">
                  
                  {/* Score */}
                  <div className="flex items-center gap-3 bg-white p-3 border border-zinc-200 rounded">
                    <div className="w-12 h-12 rounded-full border-2 border-brand-500 flex items-center justify-center font-bold text-lg text-brand-500 bg-brand-50/20">
                      {resumeReport.atsScore}%
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-800">ATS Rating Score</div>
                      <div className="text-[10px] text-zinc-400">Score based on match densities</div>
                    </div>
                  </div>

                  {/* Matched skills */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-emerald-600">Matched Skills Found:</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {resumeReport.matchedSkills?.map((s: string) => (
                        <span key={s} className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] uppercase font-semibold px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing skills */}
                  {resumeReport.missingSkills?.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-rose-500 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Recommended Missing Skills:</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {resumeReport.missingSkills.map((s: string) => (
                          <span key={s} className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] uppercase font-semibold px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions list */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">ATS Bullet Points Improvements:</div>
                    <ul className="list-disc list-inside text-zinc-600 text-xs pl-1 space-y-1">
                      {resumeReport.improvements?.map((imp: string, idx: number) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Feedback */}
                  <div className="border-t border-zinc-200 pt-3 text-zinc-500 text-xs italic">
                    {resumeReport.feedback}
                  </div>

                </div>
              ) : (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  Fill details and execute the analyzer to compile ATS results.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: INTERVIEW CHAT BOT */}
        {activeTab === 'interview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Setup card */}
            <div className="bg-zinc-50 p-5 rounded-lg border border-zinc-200 h-fit space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Interview Setup</h2>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Interview Context Type:</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="block w-full border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none"
                >
                  <option value="Technical">General Technical (SaaS/System design)</option>
                  <option value="DSA">Data Structures & Algorithms</option>
                  <option value="HR">HR / Leadership Principles</option>
                </select>
              </div>

              <button
                onClick={handleStartChat}
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded shadow-sm transition-colors"
              >
                Launch Live Session
              </button>

              {evaluationScore !== null && (
                <div className="bg-white border border-zinc-200 p-3 rounded text-center space-y-1">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">Confidence Score Evaluation:</div>
                  <div className="text-2xl font-bold text-zinc-800">{evaluationScore}/100</div>
                </div>
              )}
            </div>

            {/* Chat Frame */}
            <div className="lg:col-span-2 border border-zinc-200 rounded-lg overflow-hidden h-[450px] flex flex-col bg-white">
              
              {/* Chat Header */}
              <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between text-xs select-none">
                <span className="font-bold uppercase tracking-wider text-zinc-500">Live AI Interview Session</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">{interviewType} Mode</span>
              </div>

              {/* Chat Scroll Screen */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-50">
                {!chatStarted ? (
                  <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
                    Select a context on the left and click "Launch Live Session" to start.
                  </div>
                ) : chatHistory.length === 0 && chatLoading ? (
                  <div className="text-center py-10 animate-pulse text-zinc-400 text-xs">Initializing chat nodes...</div>
                ) : (
                  chatHistory.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[80%] ${
                        chat.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                        chat.role === 'user'
                          ? 'bg-brand-500 text-white border-transparent rounded-tr-none'
                          : 'bg-white text-zinc-800 border-zinc-200 rounded-tl-none'
                      }`}>
                        {chat.content}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && chatHistory.length > 0 && (
                  <div className="text-zinc-400 animate-pulse text-xs italic pl-1">AI interviewer is typing evaluation...</div>
                )}
              </div>

              {/* Chat input form */}
              <form onSubmit={handleSendChatMessage} className="border-t border-zinc-200 p-3 flex gap-2">
                <input
                  type="text"
                  disabled={!chatStarted || chatLoading}
                  placeholder="Type your response to the interviewer..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none focus:border-brand-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!chatStarted || chatLoading}
                  className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>
        )}

        {/* TAB 3: STUDY ROADMAPS */}
        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input panel */}
            <form onSubmit={handleGenerateRoadmap} className="bg-zinc-50 p-5 rounded-lg border border-zinc-200 h-fit space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Roadmap Inputs</h2>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Your Skill Level:</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="block w-full border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none"
                >
                  <option value="Beginner">Beginner (Basic programming loop knowledge)</option>
                  <option value="Intermediate">Intermediate (Solves array/strings problems)</option>
                  <option value="Advanced">Advanced (Solid DSA graphs & dynamic algorithms)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Target Goals:</label>
                <input
                  type="text"
                  required
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="block w-full border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Add Weak Topics:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Graphs"
                    value={weakTopicInput}
                    onChange={(e) => setWeakTopicInput(e.target.value)}
                    className="flex-1 border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addWeakTopic}
                    className="px-3 py-1 text-xs border border-zinc-300 bg-white hover:bg-zinc-50 rounded font-semibold text-zinc-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {weakTopics.map(t => (
                    <span key={t} className="bg-zinc-200 border border-zinc-300 text-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 select-none">
                      <span>{t}</span>
                      <button type="button" onClick={() => removeWeakTopic(t)} className="text-zinc-400 hover:text-zinc-700 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={roadmapLoading}
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded shadow-sm disabled:opacity-50"
              >
                {roadmapLoading ? 'Synthesizing Path...' : 'Compile Study Roadmap'}
              </button>
            </form>

            {/* Display panel */}
            <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-lg space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Target Curriculum roadmap</h2>

              {roadmapLoading ? (
                <div className="py-16 text-center text-zinc-400 animate-pulse text-xs">Generating study modules...</div>
              ) : roadmapReport ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-800">{roadmapReport.title}</h3>
                    <p className="text-xs text-zinc-400">Prepared for target goal: "{roadmapReport.targetGoal}"</p>
                  </div>

                  <div className="relative border-l-2 border-zinc-200 pl-4 space-y-6 ml-2 pt-2">
                    {roadmapReport.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[25px] top-1 bg-brand-500 rounded-full w-2 h-2" />
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-xs font-bold text-zinc-800">{step.title}</h4>
                          <span className="text-[10px] bg-brand-50 text-brand-600 border border-brand-200 px-2 py-0.5 rounded font-semibold font-mono">{step.duration}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
                        
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mr-1">Resources:</span>
                          {step.resources?.map((res: string) => (
                            <span key={res} className="bg-zinc-50 border border-zinc-200 text-zinc-600 text-[10px] px-2 py-0.5 rounded font-medium">
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                <div className="py-16 text-center text-zinc-400 text-xs">
                  Fill target weak categories and generate a timeline roadmap path.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
