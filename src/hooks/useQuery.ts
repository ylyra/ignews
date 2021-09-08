import { useRouter } from "next/router";

export function useQuery<T = any>(): T {
  const router = useRouter();

  return router.query as unknown as T;
}
