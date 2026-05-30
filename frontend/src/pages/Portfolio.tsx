import React, { useState } from 'react';
import { portfolioAPI } from '../services/api';
import { Mail, Phone, MapPin, Github, Linkedin, Send, Sparkles, Code, Server, Database, Cloud } from 'lucide-react';

export const Portfolio: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    setAlert('');

    try {
      const response = await portfolioAPI.submitContact({ name, email, message });
      setAlert(response.data.message);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setAlert('Failed to submit message. Please try emailing directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 select-text">
      
      {/* Bio / Hero Header */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-brand-500 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 fill-brand-50" />
            <span>Developer Portfolio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-950">PODUGU MUKESH</h1>
          <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Full Stack & Software Engineer</p>
          <p className="text-zinc-600 text-sm leading-relaxed">
            Experienced full stack engineer specializing in building high-scale MERN platforms, microservices architectures, real-time sync systems via WebSockets, and DevOps pipelines. Dedicated to writing clean, maintainable TypeScript / Node.js APIs and designing beautiful, accessible SaaS user interfaces.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4 text-zinc-400" />
              <a href="mailto:mukeshpodugu123@gmail.com" className="hover:text-brand-500 transition-colors">mukeshpodugu123@gmail.com</a>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-zinc-400" />
              <span>8143999463</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>Hyderabad, India</span>
            </div>
          </div>
        </div>

        {/* Links Shortcuts */}
        <div className="flex flex-col gap-2 w-full md:w-fit shrink-0">
          <a
            href="https://www.linkedin.com/in/podugu-mukesh-1575a32b4/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 px-4 py-2 rounded text-xs font-bold text-zinc-700 transition-colors"
          >
            <Linkedin className="w-4 h-4 text-sky-700 fill-sky-50" />
            <span>LinkedIn Profile</span>
          </a>
          <a
            href="https://github.com/mukeshpodugu"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 px-4 py-2 rounded text-xs font-bold text-zinc-700 transition-colors"
          >
            <Github className="w-4 h-4 text-zinc-800 fill-zinc-50" />
            <span>GitHub Repositories</span>
          </a>
        </div>
      </div>

      {/* Grid: Skills Categorized & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Spans: Skills & Projects */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Skills Section */}
          <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-brand-500" />
              <span>Technical Skills Inventory</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Category 1 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  <span>Languages</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C', 'SQL', 'HTML5', 'CSS3'].map(s => (
                    <span key={s} className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs px-2.5 py-1 rounded font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* Category 2 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span>Frontend / Styling</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['React.js', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'Monaco Editor API', 'Context API'].map(s => (
                    <span key={s} className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs px-2.5 py-1 rounded font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* Category 3 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>Backend & DB</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['Node.js', 'Express.js', 'Socket.IO', 'RESTful APIs', 'Mongoose ORM', 'MongoDB', 'PostgreSQL'].map(s => (
                    <span key={s} className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs px-2.5 py-1 rounded font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* Category 4 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>DevOps & Tools</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['Docker', 'AWS (EC2, S3)', 'Vercel', 'Render', 'Git/GitHub', 'CI/CD Pipelines'].map(s => (
                    <span key={s} className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs px-2.5 py-1 rounded font-medium">{s}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Projects section */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Featured Portfolio Projects</h2>
            
            <div className="space-y-4">
              
              {/* Project 1 */}
              <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800">CodeForge Coding Platform</h3>
                    <div className="text-[10px] text-zinc-400 font-semibold uppercase">Lead Architect & Lead Developer</div>
                  </div>
                  <span className="bg-brand-50 text-brand-600 border border-brand-200 px-2.5 py-0.5 rounded font-semibold font-mono text-[10px]">Active Project</span>
                </div>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  A high-fidelity software engineering competitive programming platform. Integrates the Monaco Editor (VS Code wrapper), standard compiler sandboxing simulations, multi-client WebSockets synchronizations, resume scans, and post-submit complexity reviewer.
                </p>
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {['React', 'TypeScript', 'Node.js', 'Socket.IO', 'Tailwind', 'Redux', 'MongoDB', 'AI API'].map(t => (
                    <span key={t} className="bg-zinc-100 border border-zinc-200 text-zinc-500 text-[10px] px-2 py-0.5 rounded font-mono font-medium">{t}</span>
                  ))}
                </div>
              </div>

              {/* Project 2 */}
              <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800">InterviewAce AI Platform</h3>
                    <div className="text-[10px] text-zinc-400 font-semibold uppercase">Lead Developer</div>
                  </div>
                  <span className="bg-zinc-50 border border-zinc-200 text-zinc-400 px-2.5 py-0.5 rounded font-semibold font-mono text-[10px]">Completed</span>
                </div>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  An AI mock interview simulator hosting HR/Technical modules. Implements voice conversion streams, confidence parameters calculations, missing skills scans, and learning roadmap modules.
                </p>
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {['React', 'Node.js', 'Express', 'Tailwind CSS', 'Gemini AI', 'WebSpeech API'].map(t => (
                    <span key={t} className="bg-zinc-100 border border-zinc-200 text-zinc-500 text-[10px] px-2 py-0.5 rounded font-mono font-medium">{t}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Span: Contact Form Box */}
        <div className="bg-white border border-zinc-200 p-6 rounded-lg h-fit space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-500" />
            <span>Contact Developer</span>
          </h2>
          <p className="text-xs text-zinc-400">Leave a secure database message. Podugu Mukesh will get back to you shortly.</p>

          {alert && (
            <div className="p-2.5 bg-blue-50 text-blue-800 border border-blue-100 rounded text-xs">
              {alert}
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hiring Manager"
                className="block w-full border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@company.com"
                className="block w-full border border-zinc-300 px-3 py-1.5 rounded text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey Mukesh! Let's chat about a position on our team..."
                rows={5}
                className="block w-full border border-zinc-300 p-2.5 rounded text-xs focus:outline-none focus:border-brand-500 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
