import { NextResponse } from "next/server";
import { subscriptionInputSchema } from "@/lib/types/subscription";
import { addSubscriber } from "@/lib/subscription/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = subscriptionInputSchema.parse(body);
    const record = await addSubscriber(data);
    return NextResponse.json({ data: record });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
