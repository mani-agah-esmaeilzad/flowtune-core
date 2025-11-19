"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateDrumPattern } from "../actions";
import { playPattern } from "@/lib/music/tonePlayer";
import { downloadJsonFile, downloadMidiFile, downloadPatternMp3 } from "@/lib/music/exporters";
import type { DrumPatternResponse } from "@/lib/types/music";
import { savePattern } from "@/lib/music/layerStore";

const styles = ["House", "Hip-Hop", "Trap", "Funk", "Afrobeat", "DnB", "Heavy Metal"];

export default function DrumsToolPage() {
  const [input, setInput] = useState({ style: "House", bars: 2 });
  const [result, setResult] = useState<DrumPatternResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateDrumPattern(input);
        setResult(data);
        savePattern("drums", data);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const canUseResult = !!result && !pending;

  return (
    <Card className="glassy shine-border shadow-floating">
      <CardHeader>
        <CardTitle>AI Drum Pattern</CardTitle>
        <CardDescription>ریتم ضربی چهارلاینی با کیک، اسنیر و های‌هت.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
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
                {styles.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>تعداد میزان</Label>
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
            onClick={() => result && playPattern("drums", result)}
          >
            پخش کن
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadJsonFile("drums.json", result)}
          >
            دانلود JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadMidiFile("drums", result, "drums.mid")}
          >
            دانلود MIDI
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canUseResult}
            onClick={() => result && downloadPatternMp3("drums", result, "drums.mp3")}
          >
            دانلود MP3
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
