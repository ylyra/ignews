import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function useQuery<
  T extends { [key: string]: any } = { [key: string]: any }
>(): T {
  const [query, setQuery] = useState<T>({} as T);
  const router = useRouter();

  useEffect(() => {
    if (router.query) {
      setQuery(router.query as unknown as T);
    }
  }, [router.query]);

  return query;
}
