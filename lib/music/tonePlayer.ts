"use client";

import * as Tone from "tone";
import { getChordNotes } from "./utils";
import type {
  ArpeggioResponse,
  BassGuitarResponse,
  ChordSuggestionResponse,
  DrumPatternResponse,
  MelodyResponse,
  ToolType,
} from "@/lib/types/music";

let initialized = false;

async function prepareTransport(tempo = 110) {
  await Tone.start();
  if (!initialized) {
    Tone.Transport.bpm.value = tempo;
    initialized = true;
  }
  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.position = 0;
  Tone.Transport.bpm.value = tempo;
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
    default:
      break;
  }
  Tone.Transport.start();
}

function scheduleChords(result: ChordSuggestionResponse) {
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  synth.set({ volume: -6, envelope: { release: 1.5 } });
  let cursor = 0;
  result.progression.forEach((chord, index) => {
    const duration = result.timing[index] || "1m";
    const seconds = Tone.Time(duration).toSeconds();
    const notes = getChordNotes(chord, 4);
    Tone.Transport.schedule((time) => {
      synth.triggerAttackRelease(notes, seconds, time);
    }, cursor);
    cursor += seconds;
  });
}

function scheduleMelody(result: MelodyResponse | ArpeggioResponse, oscillator: string) {
  const synth = new Tone.Synth({ oscillator: { type: oscillator } }).toDestination();
  result.notes.forEach((note) => {
    const duration = Tone.Time(note.duration || "8n").toSeconds();
    const time = Tone.Time(note.time ?? 0).toSeconds();
    Tone.Transport.schedule((scheduleTime) => {
      synth.triggerAttackRelease(note.note, duration, scheduleTime, note.velocity ?? 0.85);
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
      kick.triggerAttackRelease("C2", "8n", scheduleTime);
    }, Tone.Time(time).toSeconds());
  });
  result.snare.forEach((time) => {
    Tone.Transport.schedule((scheduleTime) => {
      snare.triggerAttackRelease("16n", scheduleTime);
    }, Tone.Time(time).toSeconds());
  });
  result.hihat.forEach((time) => {
    Tone.Transport.schedule((scheduleTime) => {
      hihat.triggerAttackRelease("32n", scheduleTime);
    }, Tone.Time(time).toSeconds());
  });
}

function scheduleBassGuitar(result: BassGuitarResponse) {
  const bass = new Tone.MonoSynth({ volume: -4, filter: { Q: 1.1 } }).toDestination();
  const guitar = new Tone.PluckSynth().toDestination();

  result.bass.forEach((note) => {
    Tone.Transport.schedule((scheduleTime) => {
      const duration = Tone.Time(note.duration || "8n").toSeconds();
      bass.triggerAttackRelease(note.note, duration, scheduleTime, note.velocity ?? 0.9);
    }, Tone.Time(note.time ?? 0).toSeconds());
  });

  result.guitar.forEach((note) => {
    Tone.Transport.schedule((scheduleTime) => {
      const duration = Tone.Time(note.duration || "16n").toSeconds();
      guitar.triggerAttackRelease(note.note, duration, scheduleTime, note.velocity ?? 0.8);
    }, Tone.Time(note.time ?? 0).toSeconds());
  });
}
