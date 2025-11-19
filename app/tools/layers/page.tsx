"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateBassFromGroove, generateGuitarFromDrums } from "../actions";
import { playLayerStack, playPattern } from "@/lib/music/tonePlayer";
import { downloadJsonFile } from "@/lib/music/exporters";
import { loadPattern, savePattern } from "@/lib/music/layerStore";
import type {
  ArpeggioResponse,
  BassFromGrooveResponse,
  BassGuitarResponse,
  ChordSuggestionResponse,
  DrumPatternResponse,
  GuitarFromDrumsResponse,
  LayerStackPayload,
  MelodyResponse,
} from "@/lib/types/music";

const grooveStyles = ["Cinematic", "Indie", "Funk", "Trap", "Rock"];
const grooveFeels = ["syncopated", "laid-back", "driving", "swing", "staccato"];
const keys = ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb"];

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function LayeredGroovePage() {
  const [drums, setDrums] = useState<DrumPatternResponse | null>(null);
  const [guitarLayer, setGuitarLayer] = useState<GuitarFromDrumsResponse | null>(null);
  const [bassLayer, setBassLayer] = useState<BassFromGrooveResponse | null>(null);
  const [chords, setChords] = useState<ChordSuggestionResponse | null>(null);
  const [melody, setMelody] = useState<MelodyResponse | null>(null);
  const [arpeggio, setArpeggio] = useState<ArpeggioResponse | null>(null);
  const [bassGuitar, setBassGuitar] = useState<BassGuitarResponse | null>(null);
  const [drumInput, setDrumInput] = useState("");
  const [tempo, setTempo] = useState(110);
  const [guitarForm, setGuitarForm] = useState({ style: "Cinematic", groove: "syncopated", bars: 2 });
  const [bassForm, setBassForm] = useState({ key: "C", tempo: 110, bars: 2 });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedDrums = loadPattern("drums") as DrumPatternResponse | null;
    const savedChords = loadPattern("chords") as ChordSuggestionResponse | null;
    const savedMelody = loadPattern("melody") as MelodyResponse | null;
    const savedArp = loadPattern("arpeggio") as ArpeggioResponse | null;
    const savedBassGuitar = loadPattern("bass-guitar") as BassGuitarResponse | null;
    const savedGuitar = loadPattern("guitar-from-drums") as GuitarFromDrumsResponse | null;
    const savedBass = loadPattern("bass-from-groove") as BassFromGrooveResponse | null;

    if (savedDrums) {
      setDrums(savedDrums);
      setDrumInput(JSON.stringify(savedDrums, null, 2));
      if (savedDrums.tempo) setTempo(savedDrums.tempo);
    }
    if (savedChords) setChords(savedChords);
    if (savedMelody) setMelody(savedMelody);
    if (savedArp) setArpeggio(savedArp);
    if (savedBassGuitar) {
      setBassGuitar(savedBassGuitar);
      if (savedBassGuitar.tempo) setTempo(savedBassGuitar.tempo);
    }
    if (savedGuitar) {
      setGuitarLayer(savedGuitar);
      if (savedGuitar.tempo) setTempo(savedGuitar.tempo);
    }
    if (savedBass) {
      setBassLayer(savedBass);
      if (savedBass.tempo) setTempo(savedBass.tempo);
    }
  }, []);

  const stackPayload = useMemo<LayerStackPayload>(
    () => ({
      tempo,
      drums: drums ?? undefined,
      chords: chords ?? undefined,
      melody: melody ?? undefined,
      arpeggio: arpeggio ?? undefined,
      bassGuitar: bassGuitar ?? undefined,
      guitarOverlay: guitarLayer ?? undefined,
      bassOverlay: bassLayer ?? undefined,
    }),
    [arpeggio, bassGuitar, bassLayer, chords, drums, guitarLayer, melody, tempo]
  );

  const handleLoadDrums = () => {
    const parsed = parseJson<DrumPatternResponse>(drumInput);
    if (parsed) {
      setDrums(parsed);
      setTempo(parsed.tempo ?? tempo);
      setError(null);
    } else {
      setError("نتوانستیم JSON درام را بخوانیم");
    }
  };

  const handleGuitarGenerate = () => {
    if (!drums) {
      setError("ابتدا یک الگوی درام وارد یا تولید کنید");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateGuitarFromDrums({
          drums,
          style: guitarForm.style,
          groove: guitarForm.groove,
          bars: guitarForm.bars,
        });
        setGuitarLayer(data);
        savePattern("guitar-from-drums", data);
        if (data.tempo) setTempo(data.tempo);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const handleBassGenerate = () => {
    const guitarSource = guitarLayer?.guitar ?? bassGuitar?.guitar;
    if (!drums || !guitarSource) {
      setError("برای ساخت بیس باید درام و گیتار داشته باشید");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateBassFromGroove({
          drums,
          guitar: guitarSource,
          key: bassForm.key,
          tempo: bassForm.tempo,
          bars: bassForm.bars,
        });
        setBassLayer(data);
        savePattern("bass-from-groove", data);
        setTempo(data.tempo ?? bassForm.tempo);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const handlePlayStack = () => {
    playLayerStack(stackPayload);
  };

  const combinedJson = useMemo(() => {
    return {
      tempo,
      drums,
      chords,
      melody,
      arpeggio,
      bassGuitar,
      guitarOverlay: guitarLayer,
      bassOverlay: bassLayer,
    };
  }, [arpeggio, bassGuitar, bassLayer, chords, drums, guitarLayer, melody, tempo]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">استودیو لایه‌ای FlowTune</h1>
        <p className="text-muted-foreground max-w-3xl">
          درام‌ها، گیتار، بیس و ملودی‌های مختلف را روی هم بیندازید، نتیجه هر ابزار را به ابزار بعدی بدهید و همه را همزمان با
          Tone.js پلی کنید. JSON هر لاین را هم می‌توانید دانلود یا ویرایش کنید.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glassy shine-border">
          <CardHeader>
            <CardTitle>ورود / جایگذاری درام</CardTitle>
            <CardDescription>خروجی درام را بچسبانید یا از آخرین اجراها بارگیری کنید.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={drumInput}
              onChange={(event) => setDrumInput(event.target.value)}
              className="font-mono text-xs"
              rows={10}
              placeholder="{ \"kick\": [...], \"snare\": [...], \"hihat\": [...] }"
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleLoadDrums}>بارگذاری JSON درام</Button>
              <Button
                variant="secondary"
                disabled={!drums}
                onClick={() => drums && playPattern("drums", drums)}
              >
                پخش درام
              </Button>
              <Button
                variant="outline"
                disabled={!drums}
                onClick={() => drums && downloadJsonFile("drums.json", drums)}
              >
                دانلود JSON درام
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glassy shine-border">
          <CardHeader>
            <CardTitle>گیتار از درام</CardTitle>
            <CardDescription>الگوی درام را به گیتار ریتمیک و تبلچر تبدیل کنید.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>سبک</Label>
                <Select
                  value={guitarForm.style}
                  onValueChange={(value) => setGuitarForm((prev) => ({ ...prev, style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="style" />
                  </SelectTrigger>
                  <SelectContent>
                    {grooveStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>حس</Label>
                <Select
                  value={guitarForm.groove}
                  onValueChange={(value) => setGuitarForm((prev) => ({ ...prev, groove: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="groove" />
                  </SelectTrigger>
                  <SelectContent>
                    {grooveFeels.map((feel) => (
                      <SelectItem key={feel} value={feel}>
                        {feel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تعداد میزان</Label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={guitarForm.bars}
                  onChange={(event) =>
                    setGuitarForm((prev) => ({ ...prev, bars: Number(event.target.value) || prev.bars }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGuitarGenerate} disabled={pending}>
                {pending ? "در حال ساخت" : "Generate گیتار"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!guitarLayer}
                onClick={() => guitarLayer && playPattern("guitar-from-drums", guitarLayer)}
              >
                پخش گیتار
              </Button>
              <Button
                variant="outline"
                disabled={!guitarLayer}
                onClick={() => guitarLayer && downloadJsonFile("guitar.json", guitarLayer)}
              >
                دانلود گیتار
              </Button>
            </div>
            {guitarLayer && (
              <div className="space-y-2">
                <Label>Tabs</Label>
                <pre className="rounded-md bg-black/30 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {guitarLayer.tabs.join("\n")}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glassy shine-border">
        <CardHeader>
          <CardTitle>بیس دنبال‌کننده درام و گیتار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Key</Label>
              <Select value={bassForm.key} onValueChange={(value) => setBassForm((prev) => ({ ...prev, key: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="key" />
                </SelectTrigger>
                <SelectContent>
                  {keys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tempo</Label>
              <Input
                type="number"
                min={70}
                max={170}
                value={bassForm.tempo}
                onChange={(event) => setBassForm((prev) => ({ ...prev, tempo: Number(event.target.value) || prev.tempo }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bars</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={bassForm.bars}
                onChange={(event) => setBassForm((prev) => ({ ...prev, bars: Number(event.target.value) || prev.bars }))}
              />
            </div>
            <div className="space-y-2">
              <Label>تمپو استک</Label>
              <Input
                type="number"
                min={70}
                max={170}
                value={tempo}
                onChange={(event) => setTempo(Number(event.target.value) || tempo)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleBassGenerate} disabled={pending}>
              {pending ? "در حال ساخت" : "Generate بیس"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!bassLayer}
              onClick={() => bassLayer && playPattern("bass-from-groove", bassLayer)}
            >
              پخش بیس
            </Button>
            <Button
              variant="outline"
              disabled={!bassLayer}
              onClick={() => bassLayer && downloadJsonFile("bass.json", bassLayer)}
            >
              دانلود بیس
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glassy shine-border">
        <CardHeader>
          <CardTitle>لایه‌بندی و پلی همزمان</CardTitle>
          <CardDescription>همه خروجی‌ها را روی هم قرار دهید و همزمان پلی کنید.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-foreground font-semibold mb-1">لاین‌های موجود</p>
              <ul className="space-y-1">
                <li>درام: {drums ? "✅" : "—"}</li>
                <li>گیتار از درام: {guitarLayer ? "✅" : "—"}</li>
                <li>بیس از درام/گیتار: {bassLayer ? "✅" : "—"}</li>
                <li>بیس/گیتار اصلی: {bassGuitar ? "✅" : "—"}</li>
                <li>آکورد: {chords ? "✅" : "—"}</li>
                <li>ملودی: {melody ? "✅" : "—"}</li>
                <li>آرپژ: {arpeggio ? "✅" : "—"}</li>
              </ul>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-foreground font-semibold mb-1">راه‌اندازی سریع</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={handlePlayStack} disabled={pending}>
                  پلی همه لاین‌ها
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadJsonFile("flowtune-stack.json", combinedJson)}>
                  دانلود استک
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Tone.js با همان تمپو {tempo} bpm همه لاین‌ها را پلی می‌کند.</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-foreground font-semibold mb-1">مشاهده سریع JSON</p>
              <pre className="max-h-56 overflow-auto rounded-md bg-black/40 p-3 text-[11px] leading-relaxed text-white">
                {JSON.stringify(combinedJson, null, 2)}
              </pre>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
