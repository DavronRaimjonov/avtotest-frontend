import { isServer, QueryClient } from "@tanstack/react-query";
import { cache } from "react";

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

// Serverda: har bir so'rov uchun bitta client
const getServerQueryClient = cache(makeQueryClient);

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (isServer) return getServerQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};
