"use client";

import lamejs from "lamejs";
import { Midi } from "@tonejs/midi";
import { renderLayerAudio, renderPatternAudio } from "./tonePlayer";
import { beatsFromTransport, beatsToSeconds, durationBeats, getChordNotes } from "./utils";
import type { LayerStackPayload, ToolResponseMap, ToolType, TimedNote } from "@/lib/types/music";

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

export async function downloadPatternMp3<T extends ToolType>(
  type: T,
  payload: ToolResponseMap[T],
  filename: string
) {
  if (!payload) return;
  const buffer = await renderPatternAudio(type, payload);
  if (!buffer) return;
  const blob = audioBufferToMp3Blob(buffer);
  triggerDownload(blob, filename.endsWith(".mp3") ? filename : `${filename}.mp3`);
}

export async function downloadLayerStackMp3(
  layers: LayerStackPayload,
  filename = "flowtune-stack.mp3"
) {
  const buffer = await renderLayerAudio(layers);
  if (!buffer) return;
  const blob = audioBufferToMp3Blob(buffer);
  triggerDownload(blob, filename.endsWith(".mp3") ? filename : `${filename}.mp3`);
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

function audioBufferToMp3Blob(buffer: AudioBuffer) {
  const sampleRate = buffer.sampleRate;
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  const mp3encoder = new lamejs.Mp3Encoder(2, sampleRate, 192);
  const blockSize = 1152;
  const mp3Data: Int8Array[] = [];

  for (let i = 0; i < left.length; i += blockSize) {
    const leftChunk = floatTo16BitPCM(left.subarray(i, i + blockSize));
    const rightChunk = floatTo16BitPCM(right.subarray(i, i + blockSize));
    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(new Int8Array(mp3buf));
    }
  }

  const end = mp3encoder.flush();
  if (end.length > 0) {
    mp3Data.push(new Int8Array(end));
  }

  return new Blob(mp3Data, { type: "audio/mpeg" });
}

function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}
