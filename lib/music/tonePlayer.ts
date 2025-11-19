"use client";

import * as Tone from "tone";
import { getChordNotes } from "./utils";
import type {
  ArpeggioResponse,
  BassGuitarResponse,
  GuitarFromDrumsResponse,
  BassFromGrooveResponse,
  ChordSuggestionResponse,
  DrumPatternResponse,
  MelodyResponse,
  LayerStackPayload,
  ToolType,
} from "@/lib/types/music";

let initialized = false;

async function prepareTransport(tempo = 110) {
  await Tone.start();
  if (!initialized) {
    Tone.Transport.bpm.value = tempo;
    Tone.Transport.swing = 0.2;
    Tone.Transport.swingSubdivision = "8n";
    initialized = true;
  }
  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.position = 0;
  Tone.Transport.bpm.value = tempo;
}

function humanizeTime(time: string | number | undefined, range = 0.012) {
  const base = Tone.Time(time ?? 0).toSeconds();
  const offset = (Math.random() - 0.5) * range;
  return Math.max(0, base + offset);
}

function humanizeVelocity(base = 0.85, range = 0.12) {
  const value = base + (Math.random() - 0.5) * range;
  return Math.min(1, Math.max(0.35, value));
}

export async function playPattern(type: ToolType, data: unknown) {
  if (!data) return;
  const tempo = (data as { tempo?: number }).tempo ?? 110;
  await prepareTransport(tempo);

  switch (type) {
    case "chords":
      scheduleChords(data as ChordSuggestionResponse);
      break;
    case "melody":
      scheduleMelody(data as MelodyResponse, "triangle");
      break;
    case "drums":
      scheduleDrums(data as DrumPatternResponse);
      break;
    case "arpeggio":
      scheduleMelody(data as ArpeggioResponse, "sine");
      break;
    case "bass-guitar":
      scheduleBassGuitar(data as BassGuitarResponse);
      break;
    case "guitar-from-drums":
      scheduleGuitarOverlay(data as GuitarFromDrumsResponse);
      break;
    case "bass-from-groove":
      scheduleBassOverlay(data as BassFromGrooveResponse);
      break;
    default:
      break;
  }
  Tone.Transport.start();
}

export async function playLayerStack(layers: LayerStackPayload) {
  const tempo =
    layers.tempo ||
    layers.bassGuitar?.tempo ||
    layers.guitarOverlay?.tempo ||
    layers.drums?.tempo ||
    layers.melody?.tempo ||
    110;
  await prepareTransport(tempo);

  if (layers.chords) scheduleChords(layers.chords);
  if (layers.melody) scheduleMelody(layers.melody, "triangle");
  if (layers.arpeggio) scheduleMelody(layers.arpeggio, "sine");
  if (layers.drums) scheduleDrums(layers.drums);
  if (layers.bassGuitar) scheduleBassGuitar(layers.bassGuitar);
  if (layers.guitarOverlay) scheduleGuitarOverlay(layers.guitarOverlay);
  if (layers.bassOverlay) scheduleBassOverlay(layers.bassOverlay);

  Tone.Transport.start();
}

function scheduleChords(result: ChordSuggestionResponse) {
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.2 }).toDestination();
  const synth = new Tone.PolySynth(Tone.Synth).connect(reverb);
  synth.set({ volume: -6, envelope: { release: 1.8 } });
  let cursor = 0;
  result.progression.forEach((chord, index) => {
    const duration = result.timing[index] || "1m";
    const seconds = Tone.Time(duration).toSeconds();
    const notes = getChordNotes(chord, 4);
    Tone.Transport.schedule((time) => {
      synth.triggerAttackRelease(notes, seconds, time);
    }, humanizeTime(cursor));
    cursor += seconds;
  });
}

function scheduleMelody(result: MelodyResponse | ArpeggioResponse, oscillator: string) {
  const reverb = new Tone.Reverb({ decay: 2.1, wet: 0.22 }).toDestination();
  const delay = new Tone.FeedbackDelay("8n", 0.18).toDestination();
  const synth = new Tone.Synth({ oscillator: { type: oscillator } }).chain(delay, reverb, Tone.Destination);
  result.notes.forEach((note) => {
    const duration = Tone.Time(note.duration || "8n").toSeconds();
    const time = humanizeTime(note.time, 0.02);
    const velocity = humanizeVelocity(note.velocity ?? 0.85, 0.08);
    Tone.Transport.schedule((scheduleTime) => {
      synth.triggerAttackRelease(note.note, duration, scheduleTime, velocity);
    }, time);
  });
}

function scheduleDrums(result: DrumPatternResponse) {
  const kick = new Tone.MembraneSynth({ volume: -4 }).toDestination();
  const snare = new Tone.NoiseSynth({
    volume: -8,
    envelope: { sustain: 0.02 },
    filter: { type: "highpass", Q: 1, frequency: 1400 },
  }).toDestination();
  const hihat = new Tone.MetalSynth({ volume: -10, resonance: 4000 }).toDestination();

  result.kick.forEach((time) => {
    Tone.Transport.schedule((scheduleTime) => {
      kick.triggerAttackRelease("C2", "8n", scheduleTime, humanizeVelocity(0.95, 0.06));
    }, humanizeTime(time, 0.015));
  });
  result.snare.forEach((time) => {
    Tone.Transport.schedule((scheduleTime) => {
      snare.triggerAttackRelease("16n", scheduleTime, humanizeVelocity(0.9, 0.12));
    }, humanizeTime(time, 0.02));
  });
  result.hihat.forEach((time) => {
    Tone.Transport.schedule((scheduleTime) => {
      hihat.triggerAttackRelease("32n", scheduleTime, humanizeVelocity(0.7, 0.1));
    }, humanizeTime(time, 0.014));
  });
}

function scheduleBassGuitar(result: BassGuitarResponse) {
  const reverb = new Tone.Reverb({ decay: 2.2, wet: 0.18 }).toDestination();
  const bass = new Tone.MonoSynth({ volume: -4, filter: { Q: 1.1 } }).connect(reverb);
  const guitar = new Tone.PluckSynth().connect(reverb);

  result.bass.forEach((note) => {
    Tone.Transport.schedule((scheduleTime) => {
      const duration = Tone.Time(note.duration || "8n").toSeconds();
      const velocity = humanizeVelocity(note.velocity ?? 0.9, 0.1);
      bass.triggerAttackRelease(note.note, duration, scheduleTime, velocity);
    }, humanizeTime(note.time, 0.02));
  });

  result.guitar.forEach((note) => {
    Tone.Transport.schedule((scheduleTime) => {
      const duration = Tone.Time(note.duration || "16n").toSeconds();
      const velocity = humanizeVelocity(note.velocity ?? 0.8, 0.12);
      guitar.triggerAttackRelease(note.note, duration, scheduleTime, velocity);
    }, humanizeTime(note.time, 0.018));
  });
}

function scheduleGuitarOverlay(result: GuitarFromDrumsResponse) {
  const reverb = new Tone.Reverb({ decay: 2.4, wet: 0.2 }).toDestination();
  const chorus = new Tone.Chorus(4, 2.5, 0.3).start();
  const guitar = new Tone.PluckSynth({ volume: -3 }).chain(chorus, reverb, Tone.Destination);

  result.guitar.forEach((note) => {
    Tone.Transport.schedule((scheduleTime) => {
      const duration = Tone.Time(note.duration || "16n").toSeconds();
      const velocity = humanizeVelocity(note.velocity ?? 0.82, 0.14);
      guitar.triggerAttackRelease(note.note, duration, scheduleTime, velocity);
    }, humanizeTime(note.time, 0.015));
  });
}

function scheduleBassOverlay(result: BassFromGrooveResponse) {
  const reverb = new Tone.Reverb({ decay: 2, wet: 0.16 }).toDestination();
  const bass = new Tone.MonoSynth({ volume: -2, filter: { Q: 1.2, type: "lowpass", frequency: 600 } }).connect(reverb);

  result.bass.forEach((note) => {
    Tone.Transport.schedule((scheduleTime) => {
      const duration = Tone.Time(note.duration || "8n").toSeconds();
      const velocity = humanizeVelocity(note.velocity ?? 0.9, 0.12);
      bass.triggerAttackRelease(note.note, duration, scheduleTime, velocity);
    }, humanizeTime(note.time, 0.018));
  });
}
