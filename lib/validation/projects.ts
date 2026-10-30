import { z } from "zod";

const repositoryPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
const secureDemoUrl = z.string().trim().url().refine((value) => {
  const parsed = new URL(value);
  return parsed.protocol === "https:" && !parsed.username && !parsed.password;
}, "Use a secure HTTPS demo URL without embedded credentials.");

const projectInputBaseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(8).max(140),
  description: z.string().trim().min(20).max(2_000),
  repositoryUrl: z.string().trim().regex(repositoryPattern, "Use an HTTPS github.com owner/repository URL."),
  demoUrl: secureDemoUrl.optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(32).regex(/^[a-z0-9][a-z0-9 +#.-]*$/i, "Use letters, numbers, spaces, +, #, dots, or hyphens for topics." )).min(1).max(5),
});

export const projectInputSchema = projectInputBaseSchema.transform((input) => ({
  ...input,
  tags: [...new Set(input.tags.map((tag) => tag.toLowerCase()))],
}));

export type ProjectInput = z.infer<typeof projectInputSchema>;
