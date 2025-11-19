import { promises as fs } from "fs";
import path from "path";
import type { SubscriptionInput, SubscriptionRecord } from "@/lib/types/subscription";

const dataDir = path.join(process.cwd(), "data");
const dataPath = path.join(dataDir, "subscribers.json");

async function ensureStore(): Promise<void> {
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

async function readSubscribers(): Promise<SubscriptionRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(dataPath, "utf8");
  if (!raw) return [];
  return JSON.parse(raw) as SubscriptionRecord[];
}

export async function addSubscriber(input: SubscriptionInput): Promise<SubscriptionRecord> {
  const subscribers = await readSubscribers();
  const record: SubscriptionRecord = { ...input, createdAt: new Date().toISOString() };
  const existingIndex = subscribers.findIndex((item) => item.email === input.email && item.plan === input.plan);

  if (existingIndex >= 0) {
    subscribers[existingIndex] = record;
  } else {
    subscribers.push(record);
  }

  await fs.writeFile(dataPath, JSON.stringify(subscribers, null, 2), "utf8");
  return record;
}

export async function listSubscribers(): Promise<SubscriptionRecord[]> {
  return readSubscribers();
}
