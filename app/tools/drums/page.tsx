"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateDrumPattern } from "../actions";
import { playPattern } from "@/lib/music/tonePlayer";
import { downloadJsonFile, downloadMidiFile } from "@/lib/music/exporters";
import type { DrumPatternResponse } from "@/lib/types/music";

const styles = ["House", "Hip-Hop", "Trap", "Funk", "Afrobeat", "DnB"];

export default function DrumsToolPage() {
  const [style, setStyle] = useState("House");
  const [result, setResult] = useState<DrumPatternResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateDrumPattern({ style });
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
        <CardTitle>AI Drum Pattern</CardTitle>
        <CardDescription>ریتم ضربی چهارلاینی با کیک، اسنیر و های‌هت.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-sm">
          <Label>سبک</Label>
          <Select value={style} onValueChange={setStyle}>
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
