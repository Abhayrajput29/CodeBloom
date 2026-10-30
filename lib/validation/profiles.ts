import { z } from "zod";

export const profileUpdateSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9_-]{2,29}$/, "Use 3–30 lowercase letters, numbers, underscores, or hyphens; start with a letter or number."),
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(500).optional().default(""),
}).strict();

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export type ProfileRecord = ProfileUpdate & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicProfile = Pick<ProfileRecord, "username" | "displayName" | "bio" | "createdAt">;
