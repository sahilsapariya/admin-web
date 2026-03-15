"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";
import { FeeStructureFormModal } from "@/components/finance/FeeStructureFormModal";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-IN");
  } catch {
    return s;
  }
}

export default function FeeStructureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [editOpen, setEditOpen] = useState(false);

  const { data: structure, isLoading } = useQuery({
    queryKey: ["finance", "structure", id],
    queryFn: () => financeService.getStructure(id!),
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this fee structure?"))
      return;
    try {
      await financeService.deleteStructure(id);
      router.push("/finance/structures");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleUpdated = () => {
    setEditOpen(false);
  };

  if (isLoading || !id) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Fee structure not found.</p>
        <Button asChild variant="outline">
          <Link href="/finance/structures">Back to Structures</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/finance/structures">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {structure.name}
            </h1>
            <p className="text-muted-foreground">
              Due {formatDate(structure.due_date)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="gap-2"
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Fee structure configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Name</p>
              <p className="text-sm">{structure.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Due Date
              </p>
              <p className="text-sm">{formatDate(structure.due_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Classes
              </p>
              <p className="text-sm">
                {structure.class_ids?.length
                  ? `${structure.class_ids.length} class(es)`
                  : "All classes"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
            <CardDescription>Fee components and amounts</CardDescription>
          </CardHeader>
          <CardContent>
            {structure.components?.length ? (
              <ul className="space-y-2">
                {structure.components.map((c, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm"
                  >
                    <span>{c.name}</span>
                    <span>
                      ₹{Number(c.amount).toLocaleString()}
                      {c.is_optional && " (optional)"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No components defined.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <FeeStructureFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialData={structure}
        onSuccess={handleUpdated}
      />
    </div>
  );
}
