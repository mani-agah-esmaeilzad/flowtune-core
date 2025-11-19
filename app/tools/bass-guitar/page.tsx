"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateBassGuitar } from "../actions";
import { playPattern } from "@/lib/music/tonePlayer";
import { downloadJsonFile, downloadMidiFile } from "@/lib/music/exporters";
import type { BassGuitarResponse } from "@/lib/types/music";

const keyOptions = ["C", "G", "D", "A", "E", "F", "Bb", "Eb"];
const styles = ["Funk", "Disco", "Indie", "Pop", "Reggae", "Synthwave"];

export default function BassGuitarToolPage() {
  const [input, setInput] = useState({ key: "C", tempo: 110, style: "Indie" });
  const [result, setResult] = useState<BassGuitarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateBassGuitar({
          key: input.key,
          tempo: input.tempo,
          style: input.style,
        });
        setResult(data);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const canUseResult = !!result && !pending;

  return (
    <Card className="glassy shine-border shadow-floating">
      <CardHeader>
        <CardTitle>AI Bassline & Guitar Rhythm</CardTitle>
        <CardDescription>لاین بیس و ریتم گیتار هماهنگ با کلید و تمپو انتخابی.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Key</Label>
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
            <Label>Tempo (BPM)</Label>
            <Input
              type="number"
              min={60}
              max={180}
              value={input.tempo}
              onChange={(event) =>
                setInput((prev) => ({ ...prev, tempo: Number(event.target.value) || 100 }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Style</Label>
            <Select value={input.style} onValueChange={(value) => setInput((prev) => ({ ...prev, style: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {styles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
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
            onClick={() => result && playPattern("bass-guitar", result)}
          >
            پخش کن
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadJsonFile("bass-guitar.json", result)}
          >
            دانلود JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadMidiFile("bass-guitar", result, "bass-guitar.mid")}
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
