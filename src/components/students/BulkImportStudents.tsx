"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  parseAndValidateStudentRows,
  toCreateInput,
  type ParsedRow,
  type ClassItem,
} from "@/lib/studentBulkImport";
import { studentsService } from "@/services/studentsService";
import { studentsKeys } from "@/hooks/useStudents";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "upload" | "preview" | "importing" | "results";

interface BulkImportStudentsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassItem[];
  existingAdmissionNumbers: Set<string>;
}

export function BulkImportStudents({
  open,
  onOpenChange,
  classes,
  existingAdmissionNumbers,
}: BulkImportStudentsProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [defaultClassId, setDefaultClassId] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [results, setResults] = useState<{
    success: number;
    failed: { row: number; errors: string[] }[];
  } | null>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setDefaultClassId("");
    setParsedRows([]);
    setResults(null);
  }, []);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) reset();
      onOpenChange(open);
    },
    [onOpenChange, reset]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "csv" && ext !== "xls") {
      alert("Please upload a .xlsx or .csv file.");
      return;
    }
    setFile(f);
    setParsedRows([]);
    setResults(null);
  };

  const handleParse = () => {
    if (!file || !defaultClassId) {
      alert("Please select a file and default class.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        const workbook =
          typeof data === "string"
            ? XLSX.read(data, { type: "string" })
            : XLSX.read(data as ArrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
          raw: false,
        });
        const rows = parseAndValidateStudentRows(json, classes, {
          defaultClassId,
          existingAdmissionNumbers,
        });
        setParsedRows(rows);
        setStep("preview");
      } catch (err) {
        console.error(err);
        alert("Failed to parse file. Please check the format.");
      }
    };
    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const validRows = parsedRows.filter((r) => r.valid && r.data);
  const invalidRows = parsedRows.filter((r) => !r.valid);
  const canImport = validRows.length > 0;

  const handleImport = async () => {
    if (!canImport) return;
    setStep("importing");
    const failed: { row: number; errors: string[] }[] = [];
    let success = 0;
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const input = toCreateInput(row);
      if (!input) continue;
      try {
        await studentsService.createStudent(input);
        success++;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to create student";
        failed.push({ row: row.rowIndex, errors: [msg] });
      }
    }
    setResults({ success, failed });
    setStep("results");
    queryClient.invalidateQueries({ queryKey: studentsKeys.all });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) or CSV file. Required columns: name,
            guardian_name, guardian_relationship, guardian_phone. Optionally:
            email, admission_number, class, phone, date_of_birth, gender,
            address.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Class (for rows without class)</Label>
              <Select
                value={defaultClassId}
                onValueChange={setDefaultClassId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.section ? `-${c.section}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FileSpreadsheet className="size-4" />
                    {file.name}
                  </span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleParse}
                disabled={!file || !defaultClassId}
                className="gap-2"
              >
                <Upload className="size-4" />
                Parse & Preview
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="size-4" />
                Valid: {validRows.length}
              </span>
              {invalidRows.length > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="size-4" />
                  Invalid: {invalidRows.length}
                </span>
              )}
            </div>
            <div className="max-h-60 overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Admission #</th>
                    <th className="px-3 py-2 text-left">Class</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={cn(
                        "border-t border-border",
                        !row.valid && "bg-destructive/5"
                      )}
                    >
                      <td className="px-3 py-2">{row.rowIndex}</td>
                      <td className="px-3 py-2">
                        {(row.data?.name ?? row.raw?.name ?? "-") as string}
                      </td>
                      <td className="px-3 py-2">
                        {(row.data?.email ?? row.raw?.email ?? "-") as string}
                      </td>
                      <td className="px-3 py-2">
                        {(row.data?.admission_number ??
                          row.raw?.admission_number ??
                          "-") as string}
                      </td>
                      <td className="px-3 py-2">
                        {(row.data?.class_id
                          ? classes.find((c) => c.id === row.data?.class_id)
                              ?.name ?? row.data.class_id
                          : "-") as string}
                      </td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="text-green-600">OK</span>
                        ) : (
                          <span
                            className="text-destructive"
                            title={row.errors?.join(", ")}
                          >
                            {row.errors?.[0] ?? "Invalid"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={!canImport}
                className="gap-2"
              >
                Import {validRows.length} Student
                {validRows.length !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="size-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Importing students...
            </p>
          </div>
        )}

        {step === "results" && results && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h4 className="font-medium">Import Complete</h4>
              <div className="mt-2 flex gap-6 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="size-4" />
                  Success: {results.success}
                </span>
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="size-4" />
                  Failed: {results.failed.length}
                </span>
              </div>
            </div>
            {results.failed.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-destructive">
                  Failed Rows (Excel row numbers)
                </h4>
                <div className="max-h-40 overflow-auto rounded border border-border p-2 text-sm">
                  {results.failed.map((f, i) => (
                    <div
                      key={i}
                      className="flex gap-2 py-1"
                    >
                      <span className="font-mono text-muted-foreground">
                        Row {f.row}:
                      </span>
                      <span className="text-destructive">
                        {f.errors.join("; ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Close</Button>
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  setStep("upload");
                }}
              >
                Import More
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
