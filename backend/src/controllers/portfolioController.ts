import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const PORTFOLIO_CONTACTS_FILE = path.join(__dirname, '../../contacts.json');

// Ensure file exists
if (!fs.existsSync(PORTFOLIO_CONTACTS_FILE)) {
  fs.writeFileSync(PORTFOLIO_CONTACTS_FILE, JSON.stringify([], null, 2), 'utf8');
}

export const getDeveloperInfo = (req: Request, res: Response) => {
  return res.json({
    name: 'PODUGU MUKESH',
    title: 'Full Stack & Software Engineer',
    email: 'mukeshpodugu123@gmail.com',
    phone: '8143999463',
    linkedin: 'https://www.linkedin.com/in/podugu-mukesh-1575a32b4/',
    github: 'https://github.com/mukeshpodugu',
    bio: 'Experienced full stack software engineer specializing in scalable SaaS systems, microservices architectures, React, TypeScript, Node.js, and DevOps cloud structures. Passionate about algorithms, dynamic problem solving, and building premium developer workspaces.',
    skills: {
      languages: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C', 'SQL', 'HTML5', 'CSS3'],
      frontend: ['React.js', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'Monaco Editor API', 'Context API', 'Vite'],
      backend: ['Node.js', 'Express.js', 'Socket.IO (WebSockets)', 'RESTful APIs', 'Mongoose ORM'],
      databases: ['MongoDB', 'PostgreSQL', 'Redis'],
      devops: ['Docker', 'AWS (EC2, S3)', 'Vercel', 'Render', 'Git/GitHub', 'CI/CD Pipelines']
    },
    projects: [
      {
        title: 'CodeForge Coding Platform',
        description: 'A production-grade full-stack coding platform featuring a custom-integrated Monaco VS Code editor, multi-language compiler, live collaboration sync rooms, AI-powered code auditing, and resume ATS analyzers.',
        tech: ['React.js', 'TypeScript', 'Node.js', 'Socket.IO', 'Tailwind CSS', 'Redux', 'MongoDB', 'AI API'],
        role: 'Lead Architect / Sole Developer'
      },
      {
        title: 'InterviewAce AI Platform',
        description: 'AI Interview preparation engine hosting mock assessments, HR/DSA voice simulations, resume scanners, and automated speech confidence scoring.',
        tech: ['React', 'Node.js', 'Express', 'Tailwind', 'Gemini AI', 'WebSpeech API'],
        role: 'Lead Developer'
      }
    ]
  });
};

export const submitContactForm = (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  try {
    const raw = fs.readFileSync(PORTFOLIO_CONTACTS_FILE, 'utf8');
    const contacts = JSON.parse(raw);

    const newContact = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    };

    contacts.push(newContact);
    fs.writeFileSync(PORTFOLIO_CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf8');

    console.log(`[Developer Portfolio Contact Form Submission from ${name} (${email})]: "${message}"`);

    return res.json({
      message: 'Thank you for reaching out! Podugu Mukesh will get back to you shortly.',
      submissionId: newContact.id
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
