"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Receipt, Users, FileText } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">
          Manage fee structures, student fees, and payments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-5" />
              Fee Structures
            </CardTitle>
            <CardDescription>
              Create and manage fee structures by class and academic year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/finance/structures">View Structures</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-5" />
              Student Fees
            </CardTitle>
            <CardDescription>
              View student fee assignments and record payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/finance/student-fees">View Student Fees</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-5" />
              Invoices
            </CardTitle>
            <CardDescription>
              View and manage invoices and receipts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/finance/invoices">View Invoices</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
