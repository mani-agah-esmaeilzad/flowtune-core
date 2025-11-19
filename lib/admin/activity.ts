import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import type { ToolType } from "@/lib/types/music";

export type ActivitySource = "api" | "action";
export type ActivityStatus = "success" | "error";

export interface ActivityRecord {
  id: string;
  type: ToolType;
  source: ActivitySource;
  payload: Record<string, unknown>;
  response?: unknown;
  status: ActivityStatus;
  error?: string;
  tempo?: number;
  createdAt: string;
}

const dataDir = path.join(process.cwd(), "data");
const dataPath = path.join(dataDir, "generations.json");
const MAX_ROWS = 200;

async function ensureStore() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, "[]", "utf8");
  }
}

async function readActivities(): Promise<ActivityRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(dataPath, "utf8");
  if (!raw) return [];
  return JSON.parse(raw) as ActivityRecord[];
}

export async function logActivity(
  entry: Omit<ActivityRecord, "id" | "createdAt"> & Partial<Pick<ActivityRecord, "createdAt">>
): Promise<ActivityRecord> {
  const activities = await readActivities();
  const record: ActivityRecord = {
    id: randomUUID(),
    createdAt: entry.createdAt ?? new Date().toISOString(),
    ...entry,
  };

  activities.unshift(record);
  const trimmed = activities.slice(0, MAX_ROWS);
  await fs.writeFile(dataPath, JSON.stringify(trimmed, null, 2), "utf8");
  return record;
}

export async function listActivities(limit = 50): Promise<ActivityRecord[]> {
  const activities = await readActivities();
  return activities.slice(0, limit);
}

export async function getActivityMetrics(): Promise<{
  total: number;
  byTool: Record<ToolType, number>;
  lastTempo?: number;
  lastRun?: ActivityRecord;
}> {
  const activities = await readActivities();
  const byTool: Record<ToolType, number> = {
    chords: 0,
    melody: 0,
    drums: 0,
    arpeggio: 0,
    "bass-guitar": 0,
    "guitar-from-drums": 0,
    "bass-from-groove": 0,
  };
  activities.forEach((activity) => {
    byTool[activity.type] = (byTool[activity.type] ?? 0) + 1;
  });

  const lastRun = activities[0];
  const lastTempo = activities.find((item) => typeof item.tempo === "number")?.tempo;

  return { total: activities.length, byTool, lastTempo, lastRun };
}
