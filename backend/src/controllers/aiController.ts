import { Response } from 'express';
import { AiService } from '../services/aiService';
import { Repo } from '../utils/repo';
import { AuthenticatedRequest } from '../middleware/auth';

export const analyzeResume = async (req: AuthenticatedRequest, res: Response) => {
  const { fileName, skillsText, experienceText } = req.body;
  const userId = req.user!.id;

  if (!fileName || !skillsText) {
    return res.status(400).json({ message: 'File name and text content are required.' });
  }

  try {
    const report = await AiService.analyzeResume({
      fileName,
      skillsText,
      experienceText: experienceText || ''
    });

    // Save under InterviewRecords for logging history
    await Repo.createInterviewRecord({
      userId,
      type: 'Technical',
      score: report.atsScore,
      feedback: report.feedback,
      atsScore: report.atsScore,
      questions: [
        {
          question: 'Resume Skills Scan',
          answer: `File: ${fileName}`,
          evaluation: `Matched Skills: ${report.matchedSkills.join(', ')}. Missing key skills: ${report.missingSkills.join(', ')}`,
          score: report.atsScore
        }
      ]
    });

    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const chatInterview = async (req: AuthenticatedRequest, res: Response) => {
  const { history, currentMessage, type } = req.body;
  const userId = req.user!.id;

  if (!currentMessage || !type) {
    return res.status(400).json({ message: 'Current message and interview type are required.' });
  }

  try {
    const chatHistory = history || [];
    const evaluation = await AiService.chatInterview(chatHistory, currentMessage, type);

    return res.json(evaluation);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const saveInterviewResult = async (req: AuthenticatedRequest, res: Response) => {
  const { type, score, feedback, questions } = req.body;
  const userId = req.user!.id;

  if (!type || score === undefined) {
    return res.status(400).json({ message: 'Type and score are required.' });
  }

  try {
    const record = await Repo.createInterviewRecord({
      userId,
      type,
      score,
      feedback: feedback || '',
      questions: questions || []
    });

    return res.status(201).json({
      message: 'Interview evaluation saved successfully.',
      record
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const generateRoadmap = async (req: AuthenticatedRequest, res: Response) => {
  const { skillLevel, goals, weakTopics } = req.body;

  if (!skillLevel || !goals || !weakTopics) {
    return res.status(400).json({ message: 'Skill level, learning goals, and weak topics are required.' });
  }

  try {
    const roadmap = await AiService.generateRoadmap(
      skillLevel,
      goals,
      weakTopics
    );

    return res.json(roadmap);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInterviewHistory = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const history = await Repo.listInterviewRecords(userId);
    return res.json(history);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
