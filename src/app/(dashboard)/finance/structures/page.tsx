"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import type { FeeStructure } from "@/services/financeService";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { FeeStructureFormModal } from "@/components/finance/FeeStructureFormModal";

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-IN");
  } catch {
    return s;
  }
}

export default function FeeStructuresPage() {
  const router = useRouter();
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: academicYears = [] } = useAcademicYears(false);
  const { data: structures = [], isLoading } = useQuery({
    queryKey: ["finance", "structures", academicYearFilter],
    queryFn: () =>
      financeService.getStructures({
        academic_year_id: academicYearFilter || undefined,
      }),
  });

  const columns: DataTableColumn<FeeStructure>[] = [
    { key: "name", header: "Name" },
    {
      key: "class_ids",
      header: "Classes",
      cell: (r) =>
        r.class_ids?.length ? `${r.class_ids.length} class(es)` : "All",
    },
    {
      key: "due_date",
      header: "Due Date",
      cell: (r) => formatDate(r.due_date),
    },
    {
      key: "components",
      header: "Components",
      cell: (r) => (r.components?.length ?? 0).toString(),
    },
  ];

  const handleCreated = () => {
    setCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/finance">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Fee Structures
            </h1>
            <p className="text-muted-foreground">
              Create and manage fee structures by class and academic year.
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Create Structure
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={!academicYearFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setAcademicYearFilter("")}
        >
          All
        </Button>
        {academicYears.map((ay) => (
          <Button
            key={ay.id}
            variant={academicYearFilter === ay.id ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setAcademicYearFilter(academicYearFilter === ay.id ? "" : ay.id)
            }
          >
            {ay.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Structures</CardTitle>
          <CardDescription>
            Click a row to view or edit. Each structure defines fee components
            for selected classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable<FeeStructure>
            columns={columns}
            data={structures}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="No fee structures. Create one to get started."
            onRowClick={(row) =>
              router.push(`/finance/structures/${row.id}`)
            }
          />
        </CardContent>
      </Card>

      <FeeStructureFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSuccess={handleCreated}
      />
    </div>
  );
}
