import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(__dirname, '../../db.json');

export interface DBState {
  users: any[];
  problems: any[];
  submissions: any[];
  contests: any[];
  discussions: any[];
  collaborations: any[];
  notifications: any[];
  interviewRecords: any[];
}

const defaultState: DBState = {
  users: [],
  problems: [],
  submissions: [],
  contests: [],
  discussions: [],
  collaborations: [],
  notifications: [],
  interviewRecords: [],
};

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
}

export class JsonDb {
  private static readData(): DBState {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
        return defaultState;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw) as DBState;
    } catch (e) {
      console.error('Error reading JSON fallback DB:', e);
      return defaultState;
    }
  }

  private static writeData(data: DBState): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing JSON fallback DB:', e);
    }
  }

  public static getCollection<K extends keyof DBState>(key: K): DBState[K] {
    const data = this.readData();
    return data[key] || [];
  }

  public static setCollection<K extends keyof DBState>(key: K, collection: DBState[K]): void {
    const data = this.readData();
    data[key] = collection;
    this.writeData(data);
  }

  public static find(
    collectionName: keyof DBState,
    predicate: (item: any) => boolean = () => true
  ): any[] {
    const col = this.getCollection(collectionName);
    return col.filter(predicate);
  }

  public static findOne(
    collectionName: keyof DBState,
    predicate: (item: any) => boolean
  ): any | null {
    const col = this.getCollection(collectionName);
    const item = col.find(predicate);
    return item || null;
  }

  public static create(
    collectionName: keyof DBState,
    item: any
  ): any {
    const col = this.getCollection(collectionName) as any[];
    const newId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const newItem = {
      _id: newId,
      id: newId,
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    col.push(newItem);
    this.setCollection(collectionName, col);
    return newItem;
  }

  public static update(
    collectionName: keyof DBState,
    id: string,
    updates: any
  ): any | null {
    const col = this.getCollection(collectionName) as any[];
    const index = col.findIndex((item) => item._id === id || item.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...col[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    col[index] = updatedItem;
    this.setCollection(collectionName, col);
    return updatedItem;
  }

  public static delete(collectionName: keyof DBState, id: string): boolean {
    const col = this.getCollection(collectionName) as any[];
    const filtered = col.filter((item) => item._id !== id && item.id !== id);
    if (filtered.length === col.length) return false;
    this.setCollection(collectionName, filtered);
    return true;
  }
}
