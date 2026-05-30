import { isMongoConnected } from '../config/db';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { Contest } from '../models/Contest';
import { Discussion } from '../models/Discussion';
import { Collaboration, Notification, InterviewRecord } from '../models/OtherModels';
import { JsonDb } from './dbStore';

export class Repo {
  // === USER OPERATIONS ===
  public static async findUserById(id: string): Promise<any> {
    if (isMongoConnected) return await User.findById(id).exec();
    return JsonDb.findOne('users', u => u._id === id || u.id === id);
  }

  public static async findUserByEmail(email: string): Promise<any> {
    if (isMongoConnected) return await User.findOne({ email: email.toLowerCase() }).exec();
    return JsonDb.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  }

  public static async findUserByUsername(username: string): Promise<any> {
    if (isMongoConnected) return await User.findOne({ username }).exec();
    return JsonDb.findOne('users', u => u.username === username);
  }

  public static async createUser(userData: any): Promise<any> {
    if (isMongoConnected) {
      const u = new User(userData);
      return await u.save();
    }
    return JsonDb.create('users', userData);
  }

  public static async updateUser(id: string, updates: any): Promise<any> {
    if (isMongoConnected) return await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
    return JsonDb.update('users', id, updates);
  }

  // === PROBLEM OPERATIONS ===
  public static async listProblems(filter: any = {}): Promise<any> {
    if (isMongoConnected) return await Problem.find(filter).exec();
    return JsonDb.find('problems', p => {
      let match = true;
      if (filter.category) match = match && p.category === filter.category;
      if (filter.difficulty) match = match && p.difficulty === filter.difficulty;
      return match;
    });
  }

  public static async findProblemBySlug(slug: string): Promise<any> {
    if (isMongoConnected) return await Problem.findOne({ slug }).exec();
    return JsonDb.findOne('problems', p => p.slug === slug);
  }

  public static async findProblemById(id: string): Promise<any> {
    if (isMongoConnected) return await Problem.findById(id).exec();
    return JsonDb.findOne('problems', p => p._id === id || p.id === id);
  }

  public static async createProblem(problemData: any): Promise<any> {
    if (isMongoConnected) {
      const p = new Problem(problemData);
      return await p.save();
    }
    return JsonDb.create('problems', problemData);
  }

  // === SUBMISSION OPERATIONS ===
  public static async createSubmission(submissionData: any): Promise<any> {
    if (isMongoConnected) {
      const s = new Submission(submissionData);
      return await s.save();
    }
    return JsonDb.create('submissions', submissionData);
  }

  public static async listSubmissions(filter: any = {}): Promise<any> {
    if (isMongoConnected) return await Submission.find(filter).sort({ createdAt: -1 }).exec();
    return JsonDb.find('submissions', s => {
      let match = true;
      if (filter.userId) match = match && String(s.userId) === String(filter.userId);
      if (filter.problemId) match = match && String(s.problemId) === String(filter.problemId);
      return match;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // === CONTEST OPERATIONS ===
  public static async listContests(): Promise<any> {
    if (isMongoConnected) return await Contest.find().exec();
    return JsonDb.find('contests');
  }

  public static async findContestById(id: string): Promise<any> {
    if (isMongoConnected) return await Contest.findById(id).populate('problems').exec();
    const contest = JsonDb.findOne('contests', c => c._id === id || c.id === id);
    if (contest && contest.problems) {
      // populate problems manually in JSON mode
      contest.problems = contest.problems.map((pid: string) => JsonDb.findOne('problems', p => p._id === pid || p.id === pid));
    }
    return contest;
  }

  public static async createContest(contestData: any): Promise<any> {
    if (isMongoConnected) {
      const c = new Contest(contestData);
      return await c.save();
    }
    return JsonDb.create('contests', contestData);
  }

  public static async updateContest(id: string, updates: any): Promise<any> {
    if (isMongoConnected) return await Contest.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
    return JsonDb.update('contests', id, updates);
  }

  // === DISCUSSION OPERATIONS ===
  public static async listDiscussions(category?: string): Promise<any> {
    if (isMongoConnected) {
      const query = category ? { category } : {};
      return await Discussion.find(query).populate('author', 'username profile.fullName').sort({ createdAt: -1 }).exec();
    }
    const list = JsonDb.find('discussions', d => !category || d.category === category);
    // populate author details manually
    return list.map(item => {
      const user = JsonDb.findOne('users', u => u._id === item.author || u.id === item.author);
      return {
        ...item,
        author: user ? { _id: user.id, username: user.username, profile: user.profile } : { username: 'Guest' }
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async findDiscussionById(id: string): Promise<any> {
    if (isMongoConnected) return await Discussion.findById(id).populate('author', 'username profile.fullName').populate('comments.author', 'username profile.fullName').exec();
    const disc = JsonDb.findOne('discussions', d => d._id === id || d.id === id);
    if (disc) {
      const author = JsonDb.findOne('users', u => u._id === disc.author || u.id === disc.author);
      disc.author = author ? { _id: author.id, username: author.username, profile: author.profile } : { username: 'Guest' };
      if (disc.comments) {
        disc.comments = disc.comments.map((comment: any) => {
          const commentUser = JsonDb.findOne('users', u => u._id === comment.author || u.id === comment.author);
          return {
            ...comment,
            author: commentUser ? { _id: commentUser.id, username: commentUser.username, profile: commentUser.profile } : { username: 'Guest' }
          };
        });
      }
    }
    return disc;
  }

  public static async createDiscussion(discussionData: any): Promise<any> {
    if (isMongoConnected) {
      const d = new Discussion(discussionData);
      return await d.save();
    }
    return JsonDb.create('discussions', discussionData);
  }

  public static async updateDiscussion(id: string, updates: any): Promise<any> {
    if (isMongoConnected) return await Discussion.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
    return JsonDb.update('discussions', id, updates);
  }

  // === INTERVIEW OPERATIONS ===
  public static async createInterviewRecord(recordData: any): Promise<any> {
    if (isMongoConnected) {
      const rec = new InterviewRecord(recordData);
      return await rec.save();
    }
    return JsonDb.create('interviewRecords', recordData);
  }

  public static async listInterviewRecords(userId: string): Promise<any> {
    if (isMongoConnected) return await InterviewRecord.find({ userId }).sort({ createdAt: -1 }).exec();
    return JsonDb.find('interviewRecords', r => String(r.userId) === String(userId)).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
