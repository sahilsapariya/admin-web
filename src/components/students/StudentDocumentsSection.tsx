"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import {
  useStudentDocuments,
  useUploadStudentDocument,
  useDeleteStudentDocument,
} from "@/hooks/useStudentDocuments";
import {
  studentDocumentsService,
  DOCUMENT_TYPE_LABELS,
  type StudentDocument,
} from "@/services/studentDocumentsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDocumentModal } from "./UploadDocumentModal";

interface StudentDocumentsSectionProps {
  studentId: string;
}

export function StudentDocumentsSection({ studentId }: StudentDocumentsSectionProps) {
  const { data: documents = [], isLoading, refetch } = useStudentDocuments(studentId);
  const uploadMutation = useUploadStudentDocument(studentId);
  const deleteMutation = useDeleteStudentDocument(studentId);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleDelete = (doc: StudentDocument) => {
    if (confirm(`Delete "${doc.original_filename}"?`)) {
      deleteMutation.mutate(doc.id);
    }
  };

  const handleOpen = (doc: StudentDocument) => {
    if (doc.cloudinary_url) window.open(doc.cloudinary_url, "_blank");
  };

  const list = Array.isArray(documents) ? documents : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Documents</CardTitle>
        <Button size="sm" onClick={() => setUploadOpen(true)} className="gap-1">
          <Plus className="size-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="size-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No documents uploaded yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setUploadOpen(true)}
            >
              Add Document
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FileText className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {doc.document_type_label ||
                        DOCUMENT_TYPE_LABELS[doc.document_type] ||
                        doc.document_type}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {doc.original_filename}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleOpen(doc)}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(doc)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <UploadDocumentModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          studentId={studentId}
          onSuccess={() => {
            setUploadOpen(false);
            refetch();
          }}
        />
      </CardContent>
    </Card>
  );
}
