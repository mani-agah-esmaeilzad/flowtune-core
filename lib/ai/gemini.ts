import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type {
  ToolResponseMap,
  ToolType,
  ChordSuggestionResponse,
  MelodyResponse,
  DrumPatternResponse,
  ArpeggioResponse,
  BassGuitarResponse,
} from "@/lib/types/music";

const MODEL_NAME = "gemini-2.0-flash";

const chordSchema = z.object({
  progression: z.array(z.string()).min(4),
  timing: z.array(z.string()).min(4),
  tempo: z.number().optional(),
}) satisfies z.ZodType<ChordSuggestionResponse>;

const timedNoteSchema = z.object({
  note: z.string(),
  duration: z.string(),
  time: z.union([z.number(), z.string()]),
  velocity: z.number().optional(),
});

const melodySchema = z.object({
  notes: z.array(timedNoteSchema).min(2),
  tempo: z.number().optional(),
}) satisfies z.ZodType<MelodyResponse>;

const drumSchema = z.object({
  kick: z.array(z.string()),
  snare: z.array(z.string()),
  hihat: z.array(z.string()),
  tempo: z.number().optional(),
}) satisfies z.ZodType<DrumPatternResponse>;

const arpeggioSchema = melodySchema satisfies z.ZodType<ArpeggioResponse>;

const bassGuitarSchema = z.object({
  bass: z.array(timedNoteSchema),
  guitar: z.array(timedNoteSchema),
  tempo: z.number().optional(),
}) satisfies z.ZodType<BassGuitarResponse>;

const schemas: { [K in ToolType]: z.ZodType<ToolResponseMap[K]> } = {
  chords: chordSchema,
  melody: melodySchema,
  drums: drumSchema,
  arpeggio: arpeggioSchema,
  "bass-guitar": bassGuitarSchema,
};

type PromptBuilder = (payload: Record<string, unknown>) => string;

const promptBuilders: Record<ToolType, PromptBuilder> = {
  chords: ({ key, style, bars = 4 }) => `You are FlowTune, an assistant composer. Write a harmonically interesting progression for ${bars} bars in key ${key} and style ${style}.
Rules:
- Return pure JSON matching {"progression":[],"timing":[],"tempo":number}
- Use ${Number(bars) * 2} to ${Number(bars) * 3} chords including tasteful secondary dominants, borrowed chords, and inversions.
- timing array must match progression length and add up to exactly ${bars} measures using Tone.js durations (1m, 2n, 4n, 8n).
- Tempo is a bpm integer between 88-132 aligned to the style.
`,
  melody: ({ key, mood, bars = 4 }) => `Compose a memorable ${bars}-bar melody in key ${key} that feels ${mood}. Output JSON exactly like {"notes": [{"note":"E4","duration":"8n","time":0}],"tempo":number}. Each time may be number or Tone.js transport string.
Guidance:
- Keep phrases within 2 octaves, allow pickups and held notes.
- Include repetition and variation across the bars, with durations of 4n/8n/16n and occasional 2n for sustain.
- Provide at least ${Number(bars) * 4} notes and embed gentle velocity values (0.65-0.95).`,
  drums: ({ style, bars = 2 }) => `Design a ${bars}-bar drum groove for style ${style}. Respond with {"kick":[],"snare":[],"hihat":[],"tempo":number}. Use Tone.js transport times (e.g. "0:0", "0:1", "1:2.5") covering ${bars} bars (from 0:0 up to ${bars - 1}:3). Layer ghost hits and syncopation by adding sixteenth offsets like 0:2.5.`,
  arpeggio: ({ chord, speed, bars = 2 }) => `Generate an evolving ${bars}-bar arpeggio for chord ${chord} with feel ${speed}. Respond as JSON {"notes": [...],"tempo":number}. Each note requires note/duration/time. Keep motion flowing in eighths or sixteenths, include passing tones, and span up to two octaves with occasional velocity nuances.`,
  "bass-guitar": ({ key, tempo, style, bars = 2 }) => `Build a ${bars}-bar bass line and complementary guitar rhythm for key ${key} in style ${style} at tempo ${tempo} bpm. Return JSON {"bass":[{note,duration,time,velocity?}],"guitar":[{note,duration,time,velocity?}],"tempo":${tempo}}.
Guidance:
- Bass stays below C4 with syncopated drives; guitar lives C4-C6 with off-beat chops or arpeggiated swells.
- Use Tone.js times and ensure the timeline spans ${bars} bars with plenty of events (at least ${Number(bars) * 6} per lane). Include velocity dynamics between 0.6-0.95.`,
};

export async function generateFromGemini<T extends ToolType>(
  type: T,
  payload: Record<string, unknown>
): Promise<ToolResponseMap[T]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }
  const promptBuilder = promptBuilders[type];
  if (!promptBuilder) {
    throw new Error(`Unknown tool type: ${type}`);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = promptBuilder(payload);

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      responseMimeType: "application/json",
    },
  });

  const text = response.response?.text();
  if (!text) {
    throw new Error("Gemini response was empty");
  }

  const parsedJson = JSON.parse(text);
  const schema = schemas[type];
  return schema.parse(parsedJson) as ToolResponseMap[T];
}
