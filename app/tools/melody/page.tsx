"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateMelody } from "../actions";
import { playPattern } from "@/lib/music/tonePlayer";
import { downloadJsonFile, downloadMidiFile } from "@/lib/music/exporters";
import type { MelodyResponse } from "@/lib/types/music";

const keyOptions = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab"];
const moods = ["Happy", "Dreamy", "Dark", "Epic", "Hopeful", "Chill"];

export default function MelodyToolPage() {
  const [input, setInput] = useState({ key: "C", mood: "Dreamy" });
  const [result, setResult] = useState<MelodyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateMelody(input);
        setResult(data);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const canUseResult = !!result && !pending;

  return (
    <Card className="shadow-floating">
      <CardHeader>
        <CardTitle>AI Melody Generator</CardTitle>
        <CardDescription>گام و حس را مشخص کنید تا یک ملودی تراز Tone.js بگیرید.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>گام</Label>
            <Select value={input.key} onValueChange={(value) => setInput((prev) => ({ ...prev, key: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Key" />
              </SelectTrigger>
              <SelectContent>
                {keyOptions.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>حس و حال</Label>
            <Select value={input.mood} onValueChange={(value) => setInput((prev) => ({ ...prev, mood: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Mood" />
              </SelectTrigger>
              <SelectContent>
                {moods.map((mood) => (
                  <SelectItem key={mood} value={mood}>
                    {mood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleGenerate} disabled={pending}>
            {pending ? "در حال ساخت" : "Generate"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!canUseResult}
            onClick={() => result && playPattern("melody", result)}
          >
            پخش کن
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadJsonFile("melody.json", result)}
          >
            دانلود JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadMidiFile("melody", result, "melody.mid")}
          >
            دانلود MIDI
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Textarea
          readOnly
          value={result ? JSON.stringify(result, null, 2) : "خروجی JSON در اینجا نمایش داده می‌شود."}
          className="font-mono text-xs"
        />
      </CardContent>
    </Card>
  );
}
