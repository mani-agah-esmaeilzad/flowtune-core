import { NextResponse } from "next/server";
import { logActivity } from "@/lib/admin/activity";
import { generateFromGemini } from "@/lib/ai/gemini";
import type { ToolType } from "@/lib/types/music";

export async function POST(request: Request) {
  let type: ToolType | undefined;
  let payload: Record<string, unknown> | undefined;
  try {
    const body = await request.json();
    ({ type, payload } = body as { type: ToolType; payload: Record<string, unknown> });
    if (!type || !payload) {
      return NextResponse.json({ error: "type and payload are required" }, { status: 400 });
    }
    const data = await generateFromGemini(type, payload);
    await logActivity({
      type,
      source: "api",
      payload,
      response: data,
      tempo: (data as { tempo?: number }).tempo,
      status: "success",
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    if (type) {
      await logActivity({
        type,
        source: "api",
        payload: payload || {},
        status: "error",
        error: (error as Error).message,
      });
    }
    return NextResponse.json(
      { error: (error as Error).message || "Gemini generation failed" },
      { status: 500 }
    );
  }
}
