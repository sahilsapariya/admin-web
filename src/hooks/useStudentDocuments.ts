"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { studentDocumentsService } from "@/services/studentDocumentsService";

export const studentDocumentsKeys = {
  all: (studentId: string) => ["students", studentId, "documents"] as const,
};

export function useStudentDocuments(studentId: string | null) {
  return useQuery({
    queryKey: studentDocumentsKeys.all(studentId ?? ""),
    queryFn: () => studentDocumentsService.getDocuments(studentId!),
    enabled: !!studentId,
  });
}

export function useUploadStudentDocument(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentType,
      file,
    }: {
      documentType: string;
      file: File;
    }) =>
      studentDocumentsService.uploadDocument(studentId, documentType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentDocumentsKeys.all(studentId),
      });
    },
  });
}

export function useDeleteStudentDocument(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) =>
      studentDocumentsService.deleteDocument(studentId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentDocumentsKeys.all(studentId),
      });
    },
  });
}
