export function safeHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function safeGitHubRepositoryUrl(value: string): string | null {
  const normalized = safeHttpsUrl(value);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    if (url.hostname.toLowerCase() !== "github.com") return null;
    if (!/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(url.pathname)) return null;
    return `https://github.com${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return null;
  }
}
