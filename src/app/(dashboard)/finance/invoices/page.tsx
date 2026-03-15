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
import { feesService } from "@/services/feesService";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import type { FeeInvoice } from "@/services/feesService";
import { ArrowLeft } from "lucide-react";

function formatAmount(n: number) {
  return `₹${Number(n).toLocaleString()}`;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["fees", "invoices", statusFilter],
    queryFn: () =>
      feesService.getInvoices({
        status: statusFilter || undefined,
      }),
  });

  const columns: DataTableColumn<FeeInvoice>[] = [
    { key: "invoice_number", header: "Invoice #" },
    { key: "academic_year", header: "Year" },
    { key: "status", header: "Status" },
    { key: "total_amount", header: "Total", cell: (r) => formatAmount(r.total_amount) },
    { key: "amount_paid", header: "Paid", cell: (r) => formatAmount(r.amount_paid) },
    { key: "remaining_balance", header: "Balance", cell: (r) => formatAmount(r.remaining_balance) },
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
            <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              View and manage invoices and receipts.
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
        {["draft", "unpaid", "partial", "paid", "cancelled"].map((s) => (
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
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Click a row to view invoice details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable<FeeInvoice>
            columns={columns}
            data={invoices}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            emptyMessage="No invoices found."
            onRowClick={(row) => router.push(`/finance/invoices/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
