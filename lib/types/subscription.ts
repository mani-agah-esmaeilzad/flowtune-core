import { z } from "zod";

export const subscriptionPlans = ["starter", "pro", "label"] as const;

export const subscriptionInputSchema = z.object({
  name: z.string().min(2, "نام حداقل ۲ کاراکتر باشد").max(60).optional(),
  email: z.string().email("ایمیل معتبر وارد کنید"),
  plan: z.enum(subscriptionPlans),
  teamSize: z.string().max(40).optional(),
  goal: z.string().max(200).optional(),
});

export type SubscriptionInput = z.infer<typeof subscriptionInputSchema>;

export interface SubscriptionRecord extends SubscriptionInput {
  createdAt: string;
}
