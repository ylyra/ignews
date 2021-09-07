import { useRouter } from "next/router";

export function useQuery<T = any>() {
  const router = useRouter();

  return router.query as unknown as T;
}
