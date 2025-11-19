"use server";

import { logActivity } from "@/lib/admin/activity";
import { generateFromGemini } from "@/lib/ai/gemini";
import type {
  ChordSuggestionResponse,
  MelodyResponse,
  DrumPatternResponse,
  ArpeggioResponse,
  BassGuitarResponse,
  GuitarFromDrumsResponse,
  BassFromGrooveResponse,
  ToolType,
} from "@/lib/types/music";

async function recordRun<T>(type: ToolType, payload: Record<string, unknown>, runner: () => Promise<T>): Promise<T> {
  try {
    const data = await runner();
    await logActivity({
      type,
      source: "action",
      payload,
      response: data,
      tempo: (data as { tempo?: number }).tempo,
      status: "success",
    });
    return data;
  } catch (error) {
    await logActivity({
      type,
      source: "action",
      payload,
      status: "error",
      error: (error as Error).message,
    });
    throw error;
  }
}

export async function generateChordSuggestion(input: {
  key: string;
  style: string;
  bars: number;
}): Promise<ChordSuggestionResponse> {
  return recordRun("chords", input, () => generateFromGemini("chords", input));
}

export async function generateMelody(input: {
  key: string;
  mood: string;
  bars: number;
}): Promise<MelodyResponse> {
  return recordRun("melody", input, () => generateFromGemini("melody", input));
}

export async function generateDrumPattern(input: { style: string; bars: number }): Promise<DrumPatternResponse> {
  return recordRun("drums", input, () => generateFromGemini("drums", input));
}

export async function generateArpeggio(input: {
  chord: string;
  speed: string;
  bars: number;
}): Promise<ArpeggioResponse> {
  return recordRun("arpeggio", input, () => generateFromGemini("arpeggio", input));
}

export async function generateBassGuitar(input: {
  key: string;
  tempo: number;
  style: string;
  bars: number;
}): Promise<BassGuitarResponse> {
  return recordRun("bass-guitar", input, () => generateFromGemini("bass-guitar", input));
}

export async function generateGuitarFromDrums(input: {
  drums: DrumPatternResponse;
  style: string;
  groove: string;
  bars: number;
}): Promise<GuitarFromDrumsResponse> {
  return recordRun("guitar-from-drums", input, () => generateFromGemini("guitar-from-drums", input));
}

export async function generateBassFromGroove(input: {
  drums: DrumPatternResponse;
  guitar: GuitarFromDrumsResponse["guitar"] | BassGuitarResponse["guitar"];
  key: string;
  tempo: number;
  bars: number;
}): Promise<BassFromGrooveResponse> {
  return recordRun("bass-from-groove", input, () => generateFromGemini("bass-from-groove", input));
}
