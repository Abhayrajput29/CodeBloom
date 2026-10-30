import { describe, expect, it } from "vitest";
import { profileUpdateSchema } from "@/lib/validation/profiles";

describe("profileUpdateSchema", () => {
  it("normalizes usernames and trims profile text", () => {
    expect(profileUpdateSchema.parse({ username: "  Dev_One  ", displayName: "  Developer One ", bio: " Building tools. " })).toEqual({
      username: "dev_one",
      displayName: "Developer One",
      bio: "Building tools.",
    });
  });

  it("rejects usernames that violate the database constraint", () => {
    for (const username of ["ab", "-starts-wrong", "contains space", "x".repeat(31)]) {
      expect(profileUpdateSchema.safeParse({ username, displayName: "Developer", bio: "" }).success).toBe(false);
    }
  });

  it("enforces display name and bio bounds", () => {
    expect(profileUpdateSchema.safeParse({ username: "valid_name", displayName: " ", bio: "" }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({ username: "valid_name", displayName: "D", bio: "x".repeat(501) }).success).toBe(false);
  });

  it("rejects fields that the server does not authorize editing", () => {
    expect(profileUpdateSchema.safeParse({ username: "valid_name", displayName: "Developer", bio: "", id: "forged" }).success).toBe(false);
  });
});
