import { Response } from 'express';
import { Repo } from '../utils/repo';
import { AuthenticatedRequest } from '../middleware/auth';

export const getContests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contests = await Repo.listContests();
    return res.json(contests);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getContestDetail = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const contest = await Repo.findContestById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found.' });
    return res.json(contest);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const joinContest = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const contest = await Repo.findContestById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found.' });

    // Check if already joined
    const exists = contest.participants.some((p: any) => String(p.userId) === String(userId));
    if (exists) {
      return res.status(400).json({ message: 'Already joined this contest.' });
    }

    const participants = [...contest.participants, { userId, score: 0, finishTime: new Date() }];
    
    // Recalculate leaderboard mock ranks
    const leaderboard = [...contest.leaderboard];
    const username = req.user!.username;
    
    const rank = leaderboard.length + 1;
    leaderboard.push({
      rank,
      username,
      score: 0,
      timeTaken: 0
    });

    await Repo.updateContest(id, { participants, leaderboard });

    return res.json({ message: 'Successfully joined contest.', contest });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const contest = await Repo.findContestById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found.' });

    return res.json(contest.leaderboard || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
