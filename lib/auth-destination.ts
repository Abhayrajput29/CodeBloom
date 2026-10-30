export function safeAuthDestination(value: string | null | undefined, fallback = "/dashboard") {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback;
}

export function authSuccessDestination(destination: string, flow: "login" | "signup") {
  const url = new URL(safeAuthDestination(destination), "https://codebloom.local");
  if (flow === "signup" && url.pathname === "/dashboard") url.searchParams.set("welcome", "1");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function authCallbackRedirectUrl(requestUrl: string, destination: string, signupConfirmation: boolean) {
  const redirectUrl = new URL(safeAuthDestination(destination), requestUrl);
  if (signupConfirmation) redirectUrl.searchParams.set("auth_notice", "confirmed");
  return redirectUrl;
}
