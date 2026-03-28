import * as Device from "expo-device";

const normalizeEnvValue = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.startsWith("\"") && trimmed.endsWith("\"")
    ? trimmed.slice(1, -1)
    : trimmed;
};

const baseUrl = normalizeEnvValue(process.env.EXPO_PUBLIC_API_URL) ?? "http://localhost:4000";
const isLoopbackUrl = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(baseUrl);

export const apiConfig = {
  baseUrl,
  useRemote:
    normalizeEnvValue(process.env.EXPO_PUBLIC_USE_REMOTE_API) === "true" &&
    Boolean(baseUrl) &&
    !(Device.isDevice && isLoopbackUrl),
  disabledReason:
    Device.isDevice && isLoopbackUrl
      ? "Physical devices cannot reach localhost. Using local mock data instead."
      : null
};

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { authToken?: string }
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (init?.authToken) {
    headers.set("Authorization", `Bearer ${init.authToken}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
