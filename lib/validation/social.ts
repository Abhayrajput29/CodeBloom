import { z } from "zod";

const projectId = z.string().uuid();

export const socialActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("vote"), projectId, value: z.union([z.literal(-1), z.literal(1), z.null()]) }).strict(),
  z.object({ action: z.literal("bookmark"), projectId, saved: z.boolean() }).strict(),
  z.object({ action: z.literal("follow"), creatorUsername: z.string().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,29}$/), following: z.boolean() }).strict(),
  z.object({ action: z.literal("comment"), projectId, body: z.string().trim().min(1).max(2000) }).strict(),
]);

export type SocialAction = z.infer<typeof socialActionSchema>;
