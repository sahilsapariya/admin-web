"use client";

import { useState, useEffect } from "react";
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
import { attendanceService } from "@/services/attendanceService";
import type { MyClassItem, ClassAttendanceData } from "@/services/attendanceService";
import { Loader2 } from "lucide-react";

export default function AttendancePage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState<MyClassItem | null>(null);
  const [classes, setClasses] = useState<MyClassItem[]>([]);
  const [attendance, setAttendance] = useState<ClassAttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);

  useEffect(() => {
    attendanceService.getMyClasses().then((c) => {
      setClasses(c);
      setClassesLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setAttendance(null);
      return;
    }
    setLoading(true);
    attendanceService
      .getClassAttendance(selectedClass.id, selectedDate)
      .then(setAttendance)
      .catch(() => setAttendance(null))
      .finally(() => setLoading(false));
  }, [selectedClass, selectedDate]);

  const handleMark = async (studentId: string, status: string) => {
    if (!selectedClass || !attendance) return;
    const records = attendance.attendance.map((r) => ({
      student_id: r.student_id,
      status:
        r.student_id === studentId
          ? status
          : (r.status === "present" || r.status === "absent" || r.status === "late"
            ? r.status
            : "absent"),
    }));
    try {
      await attendanceService.markAttendance({
        class_id: selectedClass.id,
        date: selectedDate,
        records,
      });
      const updated = await attendanceService.getClassAttendance(
        selectedClass.id,
        selectedDate
      );
      setAttendance(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark attendance");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600";
      case "absent":
        return "text-red-600";
      case "late":
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Mark and view student attendance by class and date.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {!selectedClass ? (
        <Card>
          <CardHeader>
            <CardTitle>Select a class</CardTitle>
            <CardDescription>
              Choose a class to view and mark attendance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No classes found. Teachers can mark attendance for their assigned
                classes.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <Button
                    key={cls.id}
                    variant="outline"
                    className="h-auto flex-col items-start py-4 text-left"
                    onClick={() => setSelectedClass(cls)}
                  >
                    <span className="font-medium">
                      {cls.name} - {cls.section}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cls.student_count} students • {cls.academic_year}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedClass(null)}
            >
              ← Change class
            </Button>
            <p className="text-sm font-medium">
              {selectedClass.name} - {selectedClass.section}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-10 animate-spin text-muted-foreground" />
            </div>
          ) : attendance ? (
            <>
              <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{attendance.total_students}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {attendance.present_count}
                  </p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {attendance.absent_count}
                  </p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {attendance.late_count}
                  </p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    Click to mark Present, Absent, or Late.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attendance.attendance.map((r) => (
                      <div
                        key={r.student_id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium">{r.student_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.admission_number}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {(["present", "absent", "late"] as const).map(
                            (status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant={
                                  r.status === status ? "default" : "outline"
                                }
                                onClick={() => handleMark(r.student_id, status)}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No attendance data for this date. Mark attendance using the buttons
              above once records are loaded.
            </p>
          )}
        </>
      )}
    </div>
  );
}
