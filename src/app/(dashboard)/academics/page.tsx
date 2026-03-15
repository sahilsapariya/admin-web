"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { academicYearsService } from "@/services/academicYearsService";
import {
  BookOpen,
  BookMarked,
  ClipboardCheck,
  School,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function AcademicsPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["academics", "overview"],
    queryFn: () => academicYearsService.getOverview(),
  });

  const links = [
    { href: "/classes", label: "Classes", icon: BookOpen, description: "Manage classes and schedules" },
    { href: "/subjects", label: "Subjects", icon: BookMarked, description: "Manage subjects offered" },
    { href: "/attendance", label: "Attendance", icon: ClipboardCheck, description: "Mark and view attendance" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Academics</h1>
        <p className="text-muted-foreground">
          Manage academic operations, classes, and subjects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Quick summary of academic data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <School className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    overview?.total_classes ?? 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookMarked className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    overview?.total_subjects ?? 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Navigate to academic management sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {links.map(({ href, label, icon: Icon, description }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
