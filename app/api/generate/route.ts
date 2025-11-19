import { NextResponse } from "next/server";
import { generateFromGemini } from "@/lib/ai/gemini";
import type { ToolType } from "@/lib/types/music";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, payload } = body as { type: ToolType; payload: Record<string, unknown> };
    if (!type || !payload) {
      return NextResponse.json({ error: "type and payload are required" }, { status: 400 });
    }
    const data = await generateFromGemini(type, payload);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || "Gemini generation failed" },
      { status: 500 }
    );
  }
}
