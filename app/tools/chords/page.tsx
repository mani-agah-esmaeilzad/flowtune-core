"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateChordSuggestion } from "../actions";
import { playPattern } from "@/lib/music/tonePlayer";
import { downloadJsonFile, downloadMidiFile } from "@/lib/music/exporters";
import type { ChordSuggestionResponse } from "@/lib/types/music";
import { savePattern } from "@/lib/music/layerStore";

const keyOptions = ["C", "G", "D", "A", "E", "B", "F", "Bb", "Eb", "Ab"];
const styleOptions = ["Pop", "Rock", "Jazz", "R&B", "Lo-Fi", "Electronic"];

export default function ChordsToolPage() {
  const [input, setInput] = useState({ key: "C", style: "Pop", bars: 4 });
  const [result, setResult] = useState<ChordSuggestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateChordSuggestion(input);
        setResult(data);
        savePattern("chords", data);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const canUseResult = !!result && !pending;

  return (
    <Card className="glassy shine-border shadow-floating">
      <CardHeader>
        <CardTitle>AI Chord Suggestion</CardTitle>
        <CardDescription>گام و سبک را انتخاب کنید تا FlowTune یک progression کامل بسازد.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>گام</Label>
            <Select
              value={input.key}
              onValueChange={(value) => setInput((prev) => ({ ...prev, key: value }))}
            >
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
            <Label>سبک</Label>
            <Select
              value={input.style}
              onValueChange={(value) => setInput((prev) => ({ ...prev, style: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>طول (تعداد میزان)</Label>
            <Input
              type="number"
              min={2}
              max={8}
              value={input.bars}
              onChange={(event) =>
                setInput((prev) => ({ ...prev, bars: Number(event.target.value) || prev.bars }))
              }
            />
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
            onClick={() => result && playPattern("chords", result)}
          >
            پخش کن
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadJsonFile("chords.json", result)}
          >
            دانلود JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadMidiFile("chords", result, "chords.mid")}
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
