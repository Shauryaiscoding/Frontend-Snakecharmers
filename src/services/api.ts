const base = (
  import.meta.env.VITE_API_BASE_URL as string | undefined
)?.replace(/\/$/, "");

export async function apiGet<T>(path: string): Promise<T> {
  if (!base) {
    throw new Error("No API base URL configured");
  }

  const response = await fetch(`${base}${path}`);

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// Replace demo adapters with apiGet calls when the Python backend exposes these endpoints.
// Suggested endpoints: /api/overview, /api/warehouse/nodes, /api/inventory, /api/routes,
// /api/simulate, /api/validation, /api/roi, /api/downloads.