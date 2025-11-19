export type ToolType =
  | "chords"
  | "melody"
  | "drums"
  | "arpeggio"
  | "bass-guitar"
  | "guitar-from-drums"
  | "bass-from-groove";

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

export interface GuitarFromDrumsResponse {
  guitar: TimedNote[];
  tabs: string[];
  tempo?: number;
}

export interface BassFromGrooveResponse {
  bass: TimedNote[];
  tempo?: number;
}

export type ToolResponseMap = {
  chords: ChordSuggestionResponse;
  melody: MelodyResponse;
  drums: DrumPatternResponse;
  arpeggio: ArpeggioResponse;
  "bass-guitar": BassGuitarResponse;
  "guitar-from-drums": GuitarFromDrumsResponse;
  "bass-from-groove": BassFromGrooveResponse;
};

export interface LayerStackPayload {
  tempo?: number;
  chords?: ChordSuggestionResponse;
  melody?: MelodyResponse;
  drums?: DrumPatternResponse;
  arpeggio?: ArpeggioResponse;
  bassGuitar?: BassGuitarResponse;
  guitarOverlay?: GuitarFromDrumsResponse;
  bassOverlay?: BassFromGrooveResponse;
}
