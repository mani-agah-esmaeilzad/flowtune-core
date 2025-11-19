const NOTE_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_MAP: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

const CHORD_INTERVALS: Record<string, number[]> = {
  "": [0, 4, 7],
  m: [0, 3, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  min7: [0, 3, 7, 10],
};

function normalizePitch(pitch: string) {
  const normalized = FLAT_MAP[pitch as keyof typeof FLAT_MAP] || pitch;
  return normalized;
}

export function getChordNotes(symbol: string, octave = 4) {
  const match = symbol.trim().match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!match) {
    return ["C4", "E4", "G4"];
  }
  const root = normalizePitch(match[1].charAt(0).toUpperCase() + match[1].slice(1));
  const qualityRaw = match[2].toLowerCase();
  const qualityKey =
    Object.keys(CHORD_INTERVALS).find((q) => qualityRaw.startsWith(q) && q.length > 0) || "";
  const intervals = CHORD_INTERVALS[qualityKey] || CHORD_INTERVALS[""];
  const rootIndex = NOTE_ORDER.indexOf(root);
  if (rootIndex === -1) {
    return ["C4", "E4", "G4"];
  }
  return intervals.map((interval) => {
    const absolute = rootIndex + interval;
    const noteIndex = ((absolute % 12) + 12) % 12;
    const octaveOffset = Math.floor(absolute / 12);
    return `${NOTE_ORDER[noteIndex]}${octave + octaveOffset}`;
  });
}

export function beatsFromTransport(time: string | number): number {
  if (typeof time === "number") return time;
  if (!time) return 0;
  if (time.includes("m")) {
    const value = parseFloat(time.replace("m", ""));
    return value * 4;
  }
  if (time.includes("n")) {
    const value = parseFloat(time.replace("n", ""));
    if (value === 0) return 0;
    return 4 / value;
  }
  if (time.includes(":")) {
    const [measures = "0", quarters = "0", sixteenths = "0"] = time.split(":");
    return parseFloat(measures) * 4 + parseFloat(quarters) + parseFloat(sixteenths) / 4;
  }
  return parseFloat(time) || 0;
}

export function beatsToSeconds(beats: number, tempo = 120) {
  return (beats * 60) / tempo;
}

export function durationBeats(duration: string | number): number {
  return beatsFromTransport(duration);
}
