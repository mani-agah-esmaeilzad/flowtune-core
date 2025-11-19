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
  chords: ({ key, style }) => `You are FlowTune, an assistant composer. Generate a chord progression for key ${key} in style ${style}.
Rules:
- Return pure JSON matching {"progression":[],"timing":[],"tempo":number}
- Use 4 to 8 chords, common pop/jazz names, allow inversions.
- timing array must match progression length and use Tone.js durations such as 1m, 2n, 4n.
- Tempo is bpm integer.
`,
  melody: ({ key, mood }) => `Compose a concise melody in key ${key} that feels ${mood}. Output JSON exactly like {"notes": [{"note":"E4","duration":"8n","time":0}],"tempo":number}. Each time may be number or Tone.js transport string. Keep within one octave range and durations 4n/8n/16n.`,
  drums: ({ style }) => `Design a drum groove for style ${style}. Respond with {"kick":[],"snare":[],"hihat":[],"tempo":number}. Use Tone.js transport times (e.g. "0:0", "0:1", "0:2.5") covering at least one bar (0:0 to 0:3).`,
  arpeggio: ({ chord, speed }) => `Generate an arpeggio for chord ${chord} with feel ${speed}. Respond as JSON {"notes": [...],"tempo":number}. Each note requires note/duration/time. Use flowing sixteenth or eighth movement inside two octaves.`,
  "bass-guitar": ({ key, tempo, style }) => `Build a bass line and complementary guitar rhythm for key ${key} in style ${style} at tempo ${tempo} bpm. Return JSON {"bass":[{note,duration,time}],"guitar":[{note,duration,time}],"tempo":${tempo}}. Keep bass below C4 and guitar between C4-C6. Use Tone.js times for scheduling.`,
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
