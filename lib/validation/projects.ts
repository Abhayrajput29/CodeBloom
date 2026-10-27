import { z } from "zod";

const repositoryPattern = /^(?:https:\/\/)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;

export const projectInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(8).max(140),
  description: z.string().trim().min(20).max(2_000),
  repositoryUrl: z.string().trim().regex(repositoryPattern, "Use a valid github.com owner/repository URL."),
  demoUrl: z.url().optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(32)).min(1).max(5),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
