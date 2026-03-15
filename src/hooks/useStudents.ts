"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { studentsService } from "@/services/studentsService";
import type {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
} from "@/types/student";

export const studentsKeys = {
  all: ["students"] as const,
  list: (params?: { search?: string; class_id?: string }) =>
    [...studentsKeys.all, "list", params] as const,
  detail: (id: string) => [...studentsKeys.all, "detail", id] as const,
};

export function useStudents(params?: {
  search?: string;
  class_id?: string;
}) {
  return useQuery({
    queryKey: studentsKeys.list(params),
    queryFn: () => studentsService.getStudents(params),
  });
}

export function useStudent(id: string | null) {
  return useQuery({
    queryKey: studentsKeys.detail(id ?? ""),
    queryFn: () => studentsService.getStudent(id!),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStudentInput) =>
      studentsService.createStudent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStudentInput }) =>
      studentsService.updateStudent(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all });
      queryClient.invalidateQueries({
        queryKey: studentsKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all });
    },
  });
}
