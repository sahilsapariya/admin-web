"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function formatAmount(n: number) {
  return `₹${Number(n).toLocaleString()}`;
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-IN");
  } catch {
    return s;
  }
}

export default function StudentFeeDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const queryClient = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: studentFee, isLoading } = useQuery({
    queryKey: ["finance", "student-fee", id],
    queryFn: () => financeService.getStudentFee(id!),
    enabled: !!id,
  });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!id || isNaN(amt) || amt <= 0) {
      alert("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      await financeService.recordPayment({
        student_fee_id: id,
        amount: amt,
        method: method as "cash" | "bank" | "upi",
        notes: notes.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["finance", "student-fee", id] });
      queryClient.invalidateQueries({ queryKey: ["finance", "student-fees"] });
      setPaymentOpen(false);
      setAmount("");
      setNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !id) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!studentFee) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Student fee not found.</p>
        <Button asChild variant="outline">
          <Link href="/finance/student-fees">Back to Student Fees</Link>
        </Button>
      </div>
    );
  }

  const total = studentFee.total_amount ?? 0;
  const paid = studentFee.paid_amount ?? 0;
  const outstanding = studentFee.outstanding_amount ?? total - paid;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/finance/student-fees">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {studentFee.student_name ?? "Student"}
            </h1>
            <p className="text-muted-foreground">
              {studentFee.fee_structure_name ?? "Fee Structure"}
            </p>
          </div>
        </div>
        {outstanding > 0 && (
          <Button onClick={() => setPaymentOpen(true)}>Record Payment</Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-lg font-semibold ${
                studentFee.status === "paid"
                  ? "text-green-600"
                  : studentFee.status === "overdue"
                    ? "text-red-600"
                    : "text-amber-600"
              }`}
            >
              {studentFee.status}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatAmount(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-amber-600">
              {formatAmount(outstanding)}
            </p>
          </CardContent>
        </Card>
      </div>

      {studentFee.items && studentFee.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Components</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {studentFee.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <span>{item.component_name ?? "—"}</span>
                  <span>
                    {formatAmount(item.amount)} (paid:{" "}
                    {formatAmount(item.paid_amount ?? 0)})
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {studentFee.payments && studentFee.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {studentFee.payments.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {formatAmount(p.amount)} • {p.method} •{" "}
                    {formatDate(p.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Outstanding: {formatAmount(outstanding)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Recording…" : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
