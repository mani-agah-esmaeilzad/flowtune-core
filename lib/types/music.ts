export type ToolType = "chords" | "melody" | "drums" | "arpeggio" | "bass-guitar";

export interface ChordSuggestionResponse {
  progression: string[];
  timing: string[];
  tempo?: number;
}

export interface TimedNote {
  note: string;
  duration: string;
  time: number | string;
  velocity?: number;
}

export interface MelodyResponse {
  notes: TimedNote[];
  tempo?: number;
}

export interface DrumPatternResponse {
  kick: string[];
  snare: string[];
  hihat: string[];
  tempo?: number;
}

export type ArpeggioResponse = MelodyResponse;

export interface BassGuitarResponse {
  bass: TimedNote[];
  guitar: TimedNote[];
  tempo?: number;
}

export type ToolResponseMap = {
  chords: ChordSuggestionResponse;
  melody: MelodyResponse;
  drums: DrumPatternResponse;
  arpeggio: ArpeggioResponse;
  "bass-guitar": BassGuitarResponse;
};
