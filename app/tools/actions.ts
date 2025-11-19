"use server";

import { generateFromGemini } from "@/lib/ai/gemini";
import type {
  ChordSuggestionResponse,
  MelodyResponse,
  DrumPatternResponse,
  ArpeggioResponse,
  BassGuitarResponse,
} from "@/lib/types/music";

export async function generateChordSuggestion(input: {
  key: string;
  style: string;
}): Promise<ChordSuggestionResponse> {
  return generateFromGemini("chords", input);
}

export async function generateMelody(input: {
  key: string;
  mood: string;
}): Promise<MelodyResponse> {
  return generateFromGemini("melody", input);
}

export async function generateDrumPattern(input: { style: string }): Promise<DrumPatternResponse> {
  return generateFromGemini("drums", input);
}

export async function generateArpeggio(input: {
  chord: string;
  speed: string;
}): Promise<ArpeggioResponse> {
  return generateFromGemini("arpeggio", input);
}

export async function generateBassGuitar(input: {
  key: string;
  tempo: number;
  style: string;
}): Promise<BassGuitarResponse> {
  return generateFromGemini("bass-guitar", input);
}
