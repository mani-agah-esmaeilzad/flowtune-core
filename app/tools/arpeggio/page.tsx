"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateArpeggio } from "../actions";
import { playPattern } from "@/lib/music/tonePlayer";
import { downloadJsonFile, downloadMidiFile } from "@/lib/music/exporters";
import type { ArpeggioResponse } from "@/lib/types/music";

const feels = ["Gentle 8th", "Fast 16th", "Swing", "Triplet", "Broken Chords"];

export default function ArpeggioToolPage() {
  const [input, setInput] = useState({ chord: "Cmaj7", speed: "Gentle 8th" });
  const [result, setResult] = useState<ArpeggioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateArpeggio(input);
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
        <CardTitle>AI Arpeggio Maker</CardTitle>
        <CardDescription>یک آکورد بدهید تا الگوی آرپژ مناسب سبک انتخابی ساخته شود.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>آکورد پایه</Label>
            <Input
              value={input.chord}
              onChange={(event) => setInput((prev) => ({ ...prev, chord: event.target.value }))}
              placeholder="مثلاً Am9"
            />
          </div>
          <div className="space-y-2">
            <Label>سرعت / حس آرپژ</Label>
            <Select
              value={input.speed}
              onValueChange={(value) => setInput((prev) => ({ ...prev, speed: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Speed" />
              </SelectTrigger>
              <SelectContent>
                {feels.map((feel) => (
                  <SelectItem key={feel} value={feel}>
                    {feel}
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
            onClick={() => result && playPattern("arpeggio", result)}
          >
            پخش کن
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadJsonFile("arpeggio.json", result)}
          >
            دانلود JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadMidiFile("arpeggio", result, "arpeggio.mid")}
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
