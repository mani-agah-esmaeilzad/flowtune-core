"use client";

import { Midi } from "@tonejs/midi";
import { beatsFromTransport, beatsToSeconds, durationBeats, getChordNotes } from "./utils";
import type { ToolResponseMap, ToolType, TimedNote } from "@/lib/types/music";

export function downloadJsonFile(filename: string, data: unknown) {
  if (!data) return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
}

export function downloadMidiFile<T extends ToolType>(
  type: T,
  payload: ToolResponseMap[T],
  filename: string,
  tempo = (payload as { tempo?: number }).tempo ?? 110
) {
  if (!payload) return;
  const midi = new Midi();
  midi.header.setTempo(tempo);
  midi.header.name = `${type} pattern`;

  switch (type) {
    case "chords":
      buildChordMidi(midi.addTrack(), payload as ToolResponseMap["chords"], tempo);
      break;
    case "melody":
      buildNoteTrack(midi.addTrack(), (payload as ToolResponseMap["melody"]).notes, tempo);
      break;
    case "drums":
      buildDrumMidi(midi.addTrack(), payload as ToolResponseMap["drums"], tempo);
      break;
    case "arpeggio":
      buildNoteTrack(midi.addTrack(), (payload as ToolResponseMap["arpeggio"]).notes, tempo);
      break;
    case "bass-guitar": {
      const data = payload as ToolResponseMap["bass-guitar"];
      buildNoteTrack(midi.addTrack(), data.bass, tempo, -12);
      buildNoteTrack(midi.addTrack(), data.guitar, tempo, 0);
      break;
    }
    case "guitar-from-drums":
      buildNoteTrack(midi.addTrack(), (payload as ToolResponseMap["guitar-from-drums"]).guitar, tempo);
      break;
    case "bass-from-groove":
      buildNoteTrack(midi.addTrack(), (payload as ToolResponseMap["bass-from-groove"]).bass, tempo, -12);
      break;
    default:
      break;
  }

  const bytes = midi.toArray();
  const blob = new Blob([bytes], { type: "audio/midi" });
  triggerDownload(blob, filename.endsWith(".mid") ? filename : `${filename}.mid`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildChordMidi(track: Midi.Track, data: ToolResponseMap["chords"], tempo: number) {
  let cursorBeats = 0;
  data.progression.forEach((chord, index) => {
    const duration = data.timing[index] || "1m";
    const chordNotes = getChordNotes(chord, 4);
    const beats = durationBeats(duration);
    chordNotes.forEach((note) => {
      track.addNote({
        midi: noteToMidi(note),
        time: beatsToSeconds(cursorBeats, tempo),
        duration: beatsToSeconds(beats, tempo),
        velocity: 0.85,
      });
    });
    cursorBeats += beats;
  });
}

function buildNoteTrack(track: Midi.Track, notes: TimedNote[], tempo: number, transpose = 0) {
  notes.forEach((note) => {
    const beats = durationBeats(note.duration || "8n");
    const start = beatsFromTransport(note.time ?? 0);
    track.addNote({
      midi: noteToMidi(note.note) + transpose,
      time: beatsToSeconds(start, tempo),
      duration: beatsToSeconds(beats, tempo),
      velocity: note.velocity ?? 0.85,
    });
  });
}

function buildDrumMidi(track: Midi.Track, data: ToolResponseMap["drums"], tempo: number) {
  const addHits = (times: string[], midiNote: number) => {
    times.forEach((time) => {
      const start = beatsFromTransport(time);
      track.addNote({
        midi: midiNote,
        time: beatsToSeconds(start, tempo),
        duration: beatsToSeconds(0.25, tempo),
        velocity: 0.9,
      });
    });
  };
  addHits(data.kick, 36);
  addHits(data.snare, 38);
  addHits(data.hihat, 42);
}

function noteToMidi(note: string) {
  const match = note.match(/([A-Ga-g])([#b]?)(\d)/);
  if (!match) return 60;
  const [, letter, accidental, octaveStr] = match;
  const normalized = `${letter.toUpperCase()}${accidental}`;
  const semitones: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };
  const octave = parseInt(octaveStr, 10);
  const offset = semitones[normalized] ?? 0;
  return 12 * (octave + 1) + offset;
}
