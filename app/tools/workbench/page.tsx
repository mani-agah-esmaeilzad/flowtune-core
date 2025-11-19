"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  generateArpeggio,
  generateBassFromGroove,
  generateBassGuitar,
  generateChordSuggestion,
  generateDrumPattern,
  generateGuitarFromDrums,
  generateMelody,
} from "../actions";
import { downloadJsonFile, downloadLayerStackMp3, downloadPatternMp3 } from "@/lib/music/exporters";
import { playLayerStack, playPattern } from "@/lib/music/tonePlayer";
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

const styles = ["Cinematic", "Indie", "Funk", "Trap", "Rock", "Jazz", "House", "Heavy Metal"];
const moods = ["happy", "moody", "epic", "uplifting", "dark"];
const grooves = ["syncopated", "laid-back", "driving", "swing", "staccato"];
const arpSpeeds = ["calm", "standard", "fast", "sparkling"];
const keys = ["C", "D", "E", "F", "G", "A", "B", "Bb", "Eb"];

export default function UnifiedStudioPage() {
  const [tempo, setTempo] = useState(110);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [chordForm, setChordForm] = useState({ key: "C", style: "Cinematic", bars: 4 });
  const [melodyForm, setMelodyForm] = useState({ key: "C", mood: "happy", bars: 4 });
  const [drumForm, setDrumForm] = useState({ style: "Cinematic", bars: 4 });
  const [arpForm, setArpForm] = useState({ chord: "Cmaj7", speed: "standard", bars: 4 });
  const [bassGuitarForm, setBassGuitarForm] = useState({ key: "C", tempo: 110, style: "Cinematic", bars: 4 });
  const [guitarOverlayForm, setGuitarOverlayForm] = useState({ style: "Cinematic", groove: "syncopated", bars: 2 });
  const [bassOverlayForm, setBassOverlayForm] = useState({ key: "C", tempo: 110, bars: 2 });

  const [chords, setChords] = useState<ChordSuggestionResponse | null>(null);
  const [melody, setMelody] = useState<MelodyResponse | null>(null);
  const [drums, setDrums] = useState<DrumPatternResponse | null>(null);
  const [arpeggio, setArpeggio] = useState<ArpeggioResponse | null>(null);
  const [bassGuitar, setBassGuitar] = useState<BassGuitarResponse | null>(null);
  const [guitarOverlay, setGuitarOverlay] = useState<GuitarFromDrumsResponse | null>(null);
  const [bassOverlay, setBassOverlay] = useState<BassFromGrooveResponse | null>(null);

  const updateTempo = (value?: number) => {
    if (typeof value === "number" && !Number.isNaN(value)) {
      setTempo(value);
    }
  };

  const handleGenerate = <T,>(runner: () => Promise<T>, onSuccess: (value: T) => void) => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await runner();
        onSuccess(data);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const stackPayload = useMemo<LayerStackPayload>(
    () => ({
      tempo,
      drums: drums ?? undefined,
      chords: chords ?? undefined,
      melody: melody ?? undefined,
      arpeggio: arpeggio ?? undefined,
      bassGuitar: bassGuitar ?? undefined,
      guitarOverlay: guitarOverlay ?? undefined,
      bassOverlay: bassOverlay ?? undefined,
    }),
    [arpeggio, bassGuitar, bassOverlay, chords, drums, guitarOverlay, melody, tempo]
  );

  const combinedJson = useMemo(
    () => ({
      tempo,
      drums,
      chords,
      melody,
      arpeggio,
      bassGuitar,
      guitarOverlay,
      bassOverlay,
    }),
    [arpeggio, bassGuitar, bassOverlay, chords, drums, guitarOverlay, melody, tempo]
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">پنل یکپارچه ساخت لاین FlowTune</h1>
        <p className="text-muted-foreground max-w-3xl">
          همه ابزارها را در یک صفحه داشته باشید؛ درام بسازید، روی همان لایه گیتار و بیس بگیرید، آکورد و ملودی اضافه کنید و کل
          پروژه را همزمان پلی یا دانلود کنید.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/50 bg-red-950/60 px-4 py-3 text-sm text-red-100">{error}</div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glassy">
          <CardHeader>
            <CardTitle>درام</CardTitle>
            <CardDescription>سبک و طول را بدهید تا یک درام‌لاین پایه بسازد.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label>سبک</Label>
                <Select
                  value={drumForm.style}
                  onValueChange={(value) => setDrumForm((prev) => ({ ...prev, style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div>
                <Label>تعداد میزان</Label>
                <Input
                  type="number"
                  min={1}
                  value={drumForm.bars}
                  onChange={(event) => setDrumForm((prev) => ({ ...prev, bars: Number(event.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() =>
                  handleGenerate(
                    () => generateDrumPattern({ style: drumForm.style, bars: drumForm.bars }),
                    (data) => {
                      setDrums(data);
                      updateTempo(data.tempo);
                    }
                  )
                }
                disabled={pending}
              >
                تولید درام
              </Button>
              <Button variant="secondary" onClick={() => drums && playPattern(drums)} disabled={!drums}>
                پلی درام
              </Button>
              <Button variant="outline" onClick={() => drums && downloadJsonFile(drums, "drums.json")} disabled={!drums}>
                دانلود JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => drums && downloadPatternMp3("drums", drums, "drums.mp3")}
                disabled={!drums}
              >
                دانلود MP3
              </Button>
            </div>
            <Textarea value={drums ? JSON.stringify(drums, null, 2) : ""} readOnly rows={10} className="font-mono text-xs" />
          </CardContent>
        </Card>

        <Card className="glassy">
          <CardHeader>
            <CardTitle>آکورد / ملودی / آرپژ</CardTitle>
            <CardDescription>آکوردها را بسازید و برای ملودی و آرپژ استفاده کنید.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>گام</Label>
                <Select value={chordForm.key} onValueChange={(value) => setChordForm((prev) => ({ ...prev, key: value }))}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>سبک</Label>
                <Select
                  value={chordForm.style}
                  onValueChange={(value) => setChordForm((prev) => ({ ...prev, style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>میزان</Label>
                <Input
                  type="number"
                  min={1}
                  value={chordForm.bars}
                  onChange={(event) => setChordForm((prev) => ({ ...prev, bars: Number(event.target.value) }))}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>مود ملودی</Label>
                <Select
                  value={melodyForm.mood}
                  onValueChange={(value) => setMelodyForm((prev) => ({ ...prev, mood: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>میزان ملودی</Label>
                <Input
                  type="number"
                  min={1}
                  value={melodyForm.bars}
                  onChange={(event) => setMelodyForm((prev) => ({ ...prev, bars: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>سرعت آرپژ</Label>
                <Select value={arpForm.speed} onValueChange={(value) => setArpForm((prev) => ({ ...prev, speed: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {arpSpeeds.map((speed) => (
                      <SelectItem key={speed} value={speed}>
                        {speed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  handleGenerate(
                    () => generateChordSuggestion(chordForm),
                    (data) => {
                      setChords(data);
                    }
                  )
                }
                disabled={pending}
              >
                تولید آکورد
              </Button>
              <Button
                onClick={() =>
                  chords &&
                  handleGenerate(
                    () => generateMelody({ key: chordForm.key, mood: melodyForm.mood, bars: melodyForm.bars }),
                    (data) => setMelody(data)
                  )
                }
                disabled={!chords || pending}
              >
                ملودی از گام
              </Button>
              <Button
                onClick={() =>
                  chords &&
                  handleGenerate(
                    () =>
                      generateArpeggio({
                        chord: chords.progression?.join(" ") ?? arpForm.chord,
                        speed: arpForm.speed,
                        bars: arpForm.bars,
                      }),
                    (data) => setArpeggio(data)
                  )
                }
                disabled={!chords || pending}
              >
                آرپژ از آکورد
              </Button>
              <Button variant="secondary" onClick={() => melody && playPattern(melody)} disabled={!melody}>
                پلی ملودی
              </Button>
              <Button variant="secondary" onClick={() => arpeggio && playPattern(arpeggio)} disabled={!arpeggio}>
                پلی آرپژ
              </Button>
              <Button
                variant="outline"
                onClick={() => chords && downloadPatternMp3("chords", chords, "chords.mp3")}
                disabled={!chords}
              >
                MP3 آکورد
              </Button>
              <Button
                variant="outline"
                onClick={() => melody && downloadPatternMp3("melody", melody, "melody.mp3")}
                disabled={!melody}
              >
                MP3 ملودی
              </Button>
              <Button
                variant="outline"
                onClick={() => arpeggio && downloadPatternMp3("arpeggio", arpeggio, "arpeggio.mp3")}
                disabled={!arpeggio}
              >
                MP3 آرپژ
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Textarea
                value={chords ? JSON.stringify(chords, null, 2) : ""}
                readOnly
                rows={8}
                className="font-mono text-xs"
                placeholder="آکوردها"
              />
              <Textarea
                value={melody ? JSON.stringify(melody, null, 2) : ""}
                readOnly
                rows={8}
                className="font-mono text-xs"
                placeholder="ملودی"
              />
            </div>
            <Textarea
              value={arpeggio ? JSON.stringify(arpeggio, null, 2) : ""}
              readOnly
              rows={6}
              className="font-mono text-xs"
              placeholder="آرپژ"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glassy">
          <CardHeader>
            <CardTitle>گیتار و بیس پایه</CardTitle>
            <CardDescription>یک لاین گیتار/بیس مستقل از گام و تمپو بگیرید.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>گام</Label>
                <Select
                  value={bassGuitarForm.key}
                  onValueChange={(value) => setBassGuitarForm((prev) => ({ ...prev, key: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>سبک</Label>
                <Select
                  value={bassGuitarForm.style}
                  onValueChange={(value) => setBassGuitarForm((prev) => ({ ...prev, style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            <div className="grid gap-3 md:grid-cols-3 items-end">
              <div>
                <Label>تمپو</Label>
                <Input
                  type="number"
                  min={60}
                  max={200}
                  value={bassGuitarForm.tempo}
                  onChange={(event) => {
                    const nextTempo = Number(event.target.value);
                    setBassGuitarForm((prev) => ({ ...prev, tempo: nextTempo }));
                    updateTempo(nextTempo);
                  }}
                />
              </div>
              <div>
                <Label>میزان</Label>
                <Input
                  type="number"
                  min={1}
                  value={bassGuitarForm.bars}
                  onChange={(event) => setBassGuitarForm((prev) => ({ ...prev, bars: Number(event.target.value) }))}
                />
              </div>
              <Button
                onClick={() =>
                  handleGenerate(
                    () => generateBassGuitar(bassGuitarForm),
                    (data) => {
                      setBassGuitar(data);
                      updateTempo(data.tempo ?? bassGuitarForm.tempo);
                    }
                  )
                }
                disabled={pending}
              >
                تولید گیتار/بیس
              </Button>
            </div>
            <Textarea
              value={bassGuitar ? JSON.stringify(bassGuitar, null, 2) : ""}
              readOnly
              rows={10}
              className="font-mono text-xs"
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => bassGuitar && playPattern(bassGuitar)} disabled={!bassGuitar}>
                پلی
              </Button>
              <Button
                variant="outline"
                onClick={() => bassGuitar && downloadJsonFile(bassGuitar, "bass-guitar.json")}
                disabled={!bassGuitar}
              >
                دانلود JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => bassGuitar && downloadPatternMp3("bass-guitar", bassGuitar, "bass-guitar.mp3")}
                disabled={!bassGuitar}
              >
                دانلود MP3
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glassy">
          <CardHeader>
            <CardTitle>گیتار از درام + بیس دنبال‌کننده</CardTitle>
            <CardDescription>درام را بدهید تا گیتار با تبلچر بسازد و بیس را هماهنگ کند.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>سبک گیتار</Label>
                <Select
                  value={guitarOverlayForm.style}
                  onValueChange={(value) => setGuitarOverlayForm((prev) => ({ ...prev, style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>حس گیتار</Label>
                <Select
                  value={guitarOverlayForm.groove}
                  onValueChange={(value) => setGuitarOverlayForm((prev) => ({ ...prev, groove: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {grooves.map((groove) => (
                      <SelectItem key={groove} value={groove}>
                        {groove}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>میزان</Label>
                <Input
                  type="number"
                  min={1}
                  value={guitarOverlayForm.bars}
                  onChange={(event) =>
                    setGuitarOverlayForm((prev) => ({ ...prev, bars: Number(event.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  drums &&
                  handleGenerate(
                    () =>
                      generateGuitarFromDrums({
                        drums,
                        style: guitarOverlayForm.style,
                        groove: guitarOverlayForm.groove,
                        bars: guitarOverlayForm.bars,
                      }),
                    (data) => {
                      setGuitarOverlay(data);
                      updateTempo(data.tempo ?? tempo);
                    }
                  )
                }
                disabled={!drums || pending}
              >
                گیتار از درام
              </Button>
              <Button
                onClick={() =>
                  drums && (guitarOverlay?.guitar || bassGuitar?.guitar) &&
                  handleGenerate(
                    () =>
                      generateBassFromGroove({
                        drums,
                        guitar: (guitarOverlay?.guitar ?? bassGuitar?.guitar)!,
                        key: bassOverlayForm.key,
                        tempo: bassOverlayForm.tempo,
                        bars: bassOverlayForm.bars,
                      }),
                    (data) => {
                      setBassOverlay(data);
                      updateTempo(data.tempo ?? bassOverlayForm.tempo);
                    }
                  )
                }
                disabled={!drums || (!guitarOverlay && !bassGuitar) || pending}
              >
                بیس دنبال‌کننده
              </Button>
              <Button variant="secondary" onClick={() => guitarOverlay && playPattern(guitarOverlay)} disabled={!guitarOverlay}>
                پلی گیتار
              </Button>
              <Button variant="secondary" onClick={() => bassOverlay && playPattern(bassOverlay)} disabled={!bassOverlay}>
                پلی بیس
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  guitarOverlay && downloadPatternMp3("guitar-from-drums", guitarOverlay, "guitar-overlay.mp3")
                }
                disabled={!guitarOverlay}
              >
                MP3 گیتار
              </Button>
              <Button
                variant="outline"
                onClick={() => bassOverlay && downloadPatternMp3("bass-from-groove", bassOverlay, "bass-overlay.mp3")}
                disabled={!bassOverlay}
              >
                MP3 بیس
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Textarea
                value={guitarOverlay ? JSON.stringify(guitarOverlay, null, 2) : ""}
                readOnly
                rows={8}
                className="font-mono text-xs"
                placeholder="گیتار + تبلچر"
              />
              <Textarea
                value={bassOverlay ? JSON.stringify(bassOverlay, null, 2) : ""}
                readOnly
                rows={8}
                className="font-mono text-xs"
                placeholder="بیس دنبال‌کننده"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glassy">
        <CardHeader>
          <CardTitle>میکس و کنترل نهایی</CardTitle>
          <CardDescription>همه لاین‌ها را روی هم پلی کنید یا JSON یکپارچه را دانلود کنید.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4 items-end">
            <div>
              <Label>تمپو کل</Label>
              <Input
                type="number"
                min={60}
                max={200}
                value={tempo}
                onChange={(event) => updateTempo(Number(event.target.value))}
              />
            </div>
            <Button onClick={() => playLayerStack(stackPayload)} disabled={pending}>
              پلی همه لایه‌ها
            </Button>
            <Button variant="outline" onClick={() => downloadJsonFile(combinedJson, "flowtune-stack.json")}>دانلود JSON</Button>
            <Button variant="outline" onClick={() => downloadLayerStackMp3(stackPayload, "flowtune-stack.mp3")}>
              دانلود MP3 کل
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (melody) playPattern(melody);
                if (arpeggio) playPattern(arpeggio);
                if (bassGuitar) playPattern(bassGuitar);
              }}
            >
              پلی لاین‌های تکی
            </Button>
          </div>
          <Textarea value={JSON.stringify(combinedJson, null, 2)} readOnly rows={12} className="font-mono text-xs" />
        </CardContent>
      </Card>
    </div>
  );
}
