// actions/useteams.ts
import { useState, useEffect, useRef } from "react";
import type { Team } from "./teams";

export function useTeams(
  page: number,
  pageSize: number,
  initialData: Team[] = [],
  initialTotal: number = 0
) {
  const [teams, setTeams] = useState<Team[]>(initialData);
  const [total, setTotal] = useState<number>(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip fetch on initial mount when we already have server-rendered data
    if (isInitialMount.current && page === 1) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;

    setLoading(true);
    setError(null);

    fetch(`/api/teams?page=${page}&pageSize=${pageSize}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load teams");
        return res.json();
      })
      .then(({ teams: data, total: count }: { teams: Team[]; total: number }) => {
        setTeams(data);
        setTotal(count);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  return { teams, total, loading, error };
}
