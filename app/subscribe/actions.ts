"use server";

import { addSubscriber } from "@/lib/subscription/store";
import { subscriptionInputSchema } from "@/lib/types/subscription";
import type { SubscriptionRecord } from "@/lib/types/subscription";

export async function createSubscription(input: FormData | Record<string, unknown>): Promise<SubscriptionRecord> {
  const payload = input instanceof FormData ? Object.fromEntries(input.entries()) : input;
  const parsed = subscriptionInputSchema.parse({
    name: payload.name ?? "",
    email: payload.email,
    plan: payload.plan,
    teamSize: payload.teamSize ?? "",
    goal: payload.goal ?? "",
  });

  return addSubscriber(parsed);
}
