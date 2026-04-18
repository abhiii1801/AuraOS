import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  return res.json();
};

export function useApi<T>(endpoint: string | null) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(endpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // dedupe requests for 1 hour
  });

  const refetch = () => mutate(undefined, { revalidate: true });

  return { data, isLoading, error, refetch, isValidating };
}

export async function chatApi(message: string, context: string) {
  try {
    const res = await fetch(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context })
    });
    if (res.ok) return await res.json();
    throw new Error(`Chat API error: ${res.statusText}`);
  } catch (e) {
    console.error("Chat API failure:", e);
    // Return a graceful fallback if desired, or re-throw
    return {
      reply: "❌ System Error: The central AI intelligence is currently unreachable. Check backend connectivity.",
      action_taken: "error"
    };
  }
}

