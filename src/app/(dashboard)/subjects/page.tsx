"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "@/hooks/useSubjects";
import { SubjectFormModal } from "@/components/subjects/SubjectFormModal";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import type { Subject } from "@/types/subject";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SubjectsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);
  const { data: subjects = [], isLoading } = useSubjects();
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  const columns: DataTableColumn<Subject>[] = [
    { key: "name", header: "Name" },
    { key: "code", header: "Code", cell: (r) => r.code ?? "—" },
    { key: "description", header: "Description", cell: (r) => r.description ?? "—" },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setEditSubject(r);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteSubject(r);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (
    data: Parameters<typeof createMutation.mutateAsync>[0]
  ) => {
    if (editSubject) {
      await updateMutation.mutateAsync({
        id: editSubject.id,
        input: { name: data.name, code: data.code, description: data.description },
      });
    } else {
      await createMutation.mutateAsync(data);
    }
    setFormOpen(false);
    setEditSubject(null);
  };

  const handleDelete = async () => {
    if (!deleteSubject) return;
    try {
      await deleteMutation.mutateAsync(deleteSubject.id);
      setDeleteSubject(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">
            Manage subjects offered by the school.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditSubject(null);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          Add Subject
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
          <CardDescription>
            View and manage all subjects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={subjects}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="No subjects found. Add a subject to get started."
          />
        </CardContent>
      </Card>

      <SubjectFormModal
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditSubject(null);
        }}
        initialData={editSubject ?? undefined}
        onSubmit={handleFormSubmit}
      />

      <Dialog
        open={!!deleteSubject}
        onOpenChange={(o) => !o && setDeleteSubject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete &quot;{deleteSubject?.name}&quot;? This
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteSubject(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
