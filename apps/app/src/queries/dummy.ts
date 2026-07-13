import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { handleAPIResponse } from "@/lib/api";
import { apiClient } from "@/lib/api-client";

export const dummyQueryKeys = {
  all: ["dummies"] as const,
  detail: (id: number) => ["dummies", id] as const,
};

export const dummiesQueryOptions = queryOptions({
  queryFn: async () => {
    const res = await apiClient.dummies.$get();

    return handleAPIResponse(res);
  },
  queryKey: dummyQueryKeys.all,
});

export const dummyQueryOptions = (id: number) =>
  queryOptions({
    queryFn: async () => {
      const res = await apiClient.dummies[":id"].$get({
        param: { id: String(id) },
      });

      return handleAPIResponse(res);
    },
    queryKey: dummyQueryKeys.detail(id),
  });

export const useDummies = () => useQuery(dummiesQueryOptions);

export const useDummy = (id: number) => useQuery(dummyQueryOptions(id));

export const useCreateDummy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      json: Parameters<typeof apiClient.dummies.$post>[0]["json"],
    ) => {
      const res = await apiClient.dummies.$post({ json });

      return handleAPIResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dummyQueryKeys.all });
    },
  });
};

export const useUpdateDummy = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      json: Parameters<(typeof apiClient.dummies)[":id"]["$put"]>[0]["json"],
    ) => {
      const res = await apiClient.dummies[":id"].$put({
        json,
        param: { id: String(id) },
      });

      return handleAPIResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dummyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: dummyQueryKeys.detail(id) });
    },
  });
};

export const useDeleteDummy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.dummies[":id"].$delete({
        param: { id: String(id) },
      });

      return handleAPIResponse(res);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: dummyQueryKeys.all });
      queryClient.removeQueries({ queryKey: dummyQueryKeys.detail(id) });
    },
  });
};
