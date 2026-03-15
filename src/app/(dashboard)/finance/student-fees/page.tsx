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
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import type { StudentFee } from "@/services/financeService";
import { ArrowLeft } from "lucide-react";

function formatAmount(n: number) {
  return `₹${Number(n).toLocaleString()}`;
}

export default function StudentFeesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const { data: studentFees = [], isLoading } = useQuery({
    queryKey: ["finance", "student-fees", statusFilter],
    queryFn: () =>
      financeService.getStudentFees({
        status: statusFilter || undefined,
      }),
  });

  const columns: DataTableColumn<StudentFee>[] = [
    { key: "student_name", header: "Student", cell: (r) => r.student_name ?? "—" },
    {
      key: "fee_structure_name",
      header: "Structure",
      cell: (r) => r.fee_structure_name ?? "—",
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <span
          className={
            r.status === "paid"
              ? "text-green-600"
              : r.status === "overdue"
                ? "text-red-600"
                : "text-amber-600"
          }
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "total_amount",
      header: "Total",
      cell: (r) => formatAmount(r.total_amount ?? 0),
    },
    {
      key: "paid_amount",
      header: "Paid",
      cell: (r) => formatAmount(r.paid_amount ?? 0),
    },
    {
      key: "outstanding_amount",
      header: "Outstanding",
      cell: (r) => formatAmount(r.outstanding_amount ?? 0),
    },
  ];

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
              Student Fees
            </h1>
            <p className="text-muted-foreground">
              View student fee assignments and record payments.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={!statusFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("")}
        >
          All
        </Button>
        {["unpaid", "partial", "paid", "overdue"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Fee Assignments</CardTitle>
          <CardDescription>
            Click a row to view details and record payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable<StudentFee>
            columns={columns}
            data={studentFees}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="No student fees found."
            onRowClick={(row) => router.push(`/finance/student-fees/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
