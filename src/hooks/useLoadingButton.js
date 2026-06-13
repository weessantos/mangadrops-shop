import { useState } from "react";

export function useLoadingButton() {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    start: () => setLoading(true),
    stop: () => setLoading(false),
  };
}