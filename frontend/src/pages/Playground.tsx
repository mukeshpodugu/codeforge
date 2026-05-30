import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { problemsAPI } from '../services/api';
import { Terminal, Play, Save, Code, FolderOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Playground: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write scratch code here and execute\nconsole.log("Hello, CodeForge Playground!");');
  const { theme } = useTheme();
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Saved snippets mockup
  const [savedSnippets, setSavedSnippets] = useState<{ title: string; language: string; code: string }[]>([
    { title: 'Merge Sort helper', language: 'javascript', code: 'function mergeSort(arr) {\n  // sorting script\n}' },
    { title: 'Binary Search tree node', language: 'python', code: 'class Node:\n    def __init__(self, key):\n        self.left = None' }
  ]);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (lang === 'javascript') {
      setCode('// Write scratch code here and execute\nconsole.log("Hello, CodeForge Playground!");');
    } else if (lang === 'python') {
      setCode('# Write scratch code here and execute\nprint("Hello, CodeForge Playground!")');
    } else if (lang === 'cpp') {
      setCode('// Write scratch code here and execute\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, CodeForge Playground!" << endl;\n    return 0;\n}');
    } else if (lang === 'java') {
      setCode('// Write scratch code here and execute\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeForge Playground!");\n    }\n}');
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      // Pass a dummy problemId for run code
      const response = await problemsAPI.run({
        problemId: '66580f12be7c86a111223344', // dummy
        language: selectedLanguage,
        code,
        customInput
      });
      setResult(response.data);
    } catch (err: any) {
      setResult({
        status: 'Runtime Error',
        errorMessage: err.response?.data?.message || 'Execution error.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveSnippet = () => {
    if (!snippetTitle.trim()) {
      setAlertMsg('Please enter a snippet title.');
      return;
    }
    setSavedSnippets([...savedSnippets, { title: snippetTitle, language: selectedLanguage, code }]);
    setSnippetTitle('');
    setAlertMsg('Snippet saved successfully.');
    setTimeout(() => setAlertMsg(''), 2000);
  };

  const loadSnippet = (snippet: any) => {
    setCode(snippet.code);
    setSelectedLanguage(snippet.language);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-brand-500" />
          <span>Coding Playground</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          A sandboxed environment for testing language mechanisms and writing utility code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Editor & Console */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-t-lg flex flex-wrap justify-between items-center gap-2">
            <div className="flex gap-2">
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-white border border-zinc-300 rounded text-xs font-semibold py-1 px-2.5 focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>

          {/* Monaco Sandbox */}
          <div className="border border-zinc-200 border-t-0 rounded-b-lg overflow-hidden h-[400px]">
            <Editor
              height="100%"
              language={selectedLanguage === 'python' ? 'python' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'java' ? 'java' : 'javascript'}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              options={{ fontSize: 13, minimap: { enabled: false } }}
            />
          </div>

          {/* Input & Output Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Test Input:</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type inputs parameter values..."
                rows={4}
                className="w-full border border-zinc-300 p-2.5 rounded text-xs font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Output */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Console Output:</label>
              <div className="w-full bg-zinc-900 border border-zinc-950 p-2.5 rounded text-xs font-mono text-zinc-200 h-[92px] overflow-y-auto">
                {isRunning ? (
                  <div className="text-zinc-400 animate-pulse">Executing code...</div>
                ) : result ? (
                  <div className="space-y-1">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">Result status: {result.status}</div>
                    <div className="text-zinc-100 whitespace-pre-wrap">{result.output || result.errorMessage || 'No prints detected.'}</div>
                  </div>
                ) : (
                  <div className="text-zinc-500">Execution stdout will display here.</div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Snippet Manager Sidebar */}
        <div className="space-y-6">
          
          {/* Save Card */}
          <div className="bg-white border border-zinc-200 p-4 rounded-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Save className="w-4 h-4 text-zinc-500" />
              <span>Save Code Snippet</span>
            </h3>
            
            {alertMsg && <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-xs">{alertMsg}</div>}

            <input
              type="text"
              placeholder="Snippet title (e.g. DFS Tree)"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              className="block w-full px-2.5 py-1.5 border border-zinc-300 rounded text-xs placeholder-zinc-400 focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={handleSaveSnippet}
              className="w-full py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 border border-zinc-300 hover:border-zinc-400 rounded bg-zinc-50"
            >
              Save Snippet
            </button>
          </div>

          {/* Saved Snippets List */}
          <div className="bg-white border border-zinc-200 p-4 rounded-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <FolderOpen className="w-4 h-4 text-zinc-500" />
              <span>Saved Snippets</span>
            </h3>

            <div className="divide-y divide-zinc-100">
              {savedSnippets.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSnippet(s)}
                  className="w-full text-left py-2 hover:bg-zinc-50 px-1 rounded transition-colors group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-zinc-700 group-hover:text-brand-500">{s.title}</div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">{s.language}</div>
                  </div>
                  <Code className="w-3.5 h-3.5 text-zinc-300 group-hover:text-brand-500" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
