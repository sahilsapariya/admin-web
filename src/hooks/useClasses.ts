"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { classesService } from "@/services/classesService";
import type { CreateClassInput } from "@/types/class";

export const classesKeys = {
  all: ["classes"] as const,
  list: (params?: { academic_year_id?: string }) =>
    [...classesKeys.all, "list", params] as const,
  detail: (id: string) => [...classesKeys.all, "detail", id] as const,
};

export function useClasses(params?: { academic_year_id?: string }) {
  return useQuery({
    queryKey: classesKeys.list(params),
    queryFn: () => classesService.getClasses(params),
  });
}

export function useClass(id: string | null) {
  return useQuery({
    queryKey: classesKeys.detail(id ?? ""),
    queryFn: () => classesService.getClass(id!),
    enabled: !!id,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassInput) =>
      classesService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classesKeys.all });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: Partial<CreateClassInput> }) =>
      classesService.updateClass(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classesKeys.all });
      queryClient.invalidateQueries({
        queryKey: classesKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classesService.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classesKeys.all });
    },
  });
}
