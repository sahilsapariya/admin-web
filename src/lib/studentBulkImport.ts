/**
 * Bulk import parser and validation for students.
 * Supports .xlsx and .csv via xlsx library.
 */

import * as XLSX from "xlsx";
import type { CreateStudentInput } from "@/types/student";

/** Column header aliases for flexible mapping */
const COLUMN_ALIASES: Record<string, string[]> = {
  name: ["name", "student name", "studentname", "full name", "fullname"],
  email: ["email", "student email", "studentemail"],
  admission_number: [
    "admission_number",
    "admission number",
    "admissionnumber",
    "admission no",
    "admissionno",
  ],
  class_name: ["class", "class name", "classname", "grade", "section"],
  guardian_name: [
    "guardian_name",
    "guardian name",
    "guardianname",
    "parent name",
  ],
  guardian_relationship: [
    "guardian_relationship",
    "guardian relationship",
    "relationship",
    "guardian relation",
  ],
  guardian_phone: [
    "guardian_phone",
    "guardian phone",
    "guardianphone",
    "parent phone",
  ],
  guardian_email: ["guardian_email", "guardian email", "guardianemail"],
  phone: ["phone", "student phone", "mobile", "contact"],
  date_of_birth: ["date_of_birth", "dob", "date of birth", "birth date"],
  gender: ["gender", "sex"],
  address: ["address"],
  roll_number: ["roll_number", "roll number", "rollnumber", "roll no"],
};

function normalizeHeader(header: string): string {
  return String(header ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mapHeaderToField(header: string): string | null {
  const normalized = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(normalized)) return field;
  }
  return null;
}

function getCellValue(row: Record<string, unknown>, key: string): string {
  const val = row[key];
  if (val == null) return "";
  if (typeof val === "number") return String(val);
  return String(val).trim();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  if (!email) return true; // optional
  return EMAIL_REGEX.test(email);
}

export interface ParsedRow {
  rowIndex: number;
  originalIndex: number;
  raw: Record<string, unknown>;
  data: Partial<CreateStudentInput> & {
    class_name?: string;
  };
  errors: string[];
  valid: boolean;
}

export interface ClassItem {
  id: string;
  name: string;
  section?: string;
}

export interface ValidationOptions {
  defaultClassId?: string;
  existingAdmissionNumbers?: Set<string>;
}

export interface ParsedResult {
  rows: ParsedRow[];
  headerMap: Record<string, string>;
}

/**
 * Parse an Excel or CSV file into rows with mapped headers.
 */
export function parseStudentFile(
  file: File
): Promise<{ rows: Record<string, unknown>[]; headerMap: Record<string, string> }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }
        const workbook = XLSX.read(data, { type: "binary", raw: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error("No sheet found"));
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
          raw: false,
        });

        if (rows.length === 0) {
          resolve({ rows: [], headerMap: {} });
          return;
        }

        const firstRow = rows[0];
        const rawHeaders = Object.keys(firstRow);
        const headerMap: Record<string, string> = {};

        for (const h of rawHeaders) {
          const field = mapHeaderToField(h);
          if (field) headerMap[field] = h;
        }

        resolve({ rows, headerMap });
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Parse failed"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
}

/**
 * Validate parsed rows and resolve class_name to class_id.
 * When class_name is empty, uses defaultClassId if provided.
 */
export function validateAndMapRows(
  rows: Record<string, unknown>[],
  headerMap: Record<string, string>,
  classes: { id: string; name: string; section?: string }[],
  existingAdmissionNumbers: Set<string>,
  options?: { defaultClassId?: string }
): ParsedResult {
  const classLookup = new Map<string, string>();
  for (const c of classes) {
    const key = [c.name, c.section].filter(Boolean).join("-").toLowerCase();
    classLookup.set(key, c.id);
  }

  const seenAdmissionNumbers = new Set<string>();
  const result: ParsedRow[] = [];
  const defaultClassId = options?.defaultClassId;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2; // 1-based + header row
    const data: ParsedRow["data"] = {};
    const errors: string[] = [];

    for (const [field, excelCol] of Object.entries(headerMap)) {
      const val = getCellValue(row as Record<string, unknown>, excelCol);
      if (field === "class_name") {
        data.class_name = val || undefined;
      } else {
        (data as Record<string, unknown>)[field] = val || undefined;
      }
    }

    // Required fields
    if (!data.name) errors.push("Missing name");
    if (!data.guardian_name) errors.push("Missing guardian name");
    if (!data.guardian_relationship) errors.push("Missing guardian relationship");
    if (!data.guardian_phone) errors.push("Missing guardian phone");

    // Class resolution: use class_name or defaultClassId
    let classId: string | undefined;
    if (data.class_name) {
      const key = data.class_name.trim().toLowerCase();
      classId = classLookup.get(key);
      if (!classId) {
        errors.push(`Class "${data.class_name}" not found`);
      }
    } else if (defaultClassId) {
      classId = defaultClassId;
    } else {
      errors.push("Missing class");
    }
    if (classId) data.class_id = classId;

    // Email validation
    if (data.email && !isValidEmail(data.email)) {
      errors.push("Invalid email format");
    }

    // Duplicate admission number (within file)
    if (data.admission_number) {
      const an = data.admission_number.trim();
      if (seenAdmissionNumbers.has(an)) {
        errors.push("Duplicate admission number in file");
      }
      seenAdmissionNumbers.add(an);

      if (existingAdmissionNumbers.has(an)) {
        errors.push("Admission number already exists");
      }
    }

    result.push({
      rowIndex,
      originalIndex: i,
      raw: row as Record<string, unknown>,
      data,
      errors,
      valid: errors.length === 0,
    });
  }

  return { rows: result, headerMap };
}

/**
 * Parse JSON rows (from xlsx) and validate. Builds headerMap from first row keys.
 */
export function parseAndValidateStudentRows(
  json: Record<string, unknown>[],
  classes: ClassItem[],
  options: { defaultClassId: string; existingAdmissionNumbers: Set<string> }
): ParsedRow[] {
  if (json.length === 0) return [];

  const firstRow = json[0];
  const rawHeaders = Object.keys(firstRow);
  const headerMap: Record<string, string> = {};
  for (const h of rawHeaders) {
    const field = mapHeaderToField(h);
    if (field) headerMap[field] = h;
  }

  const { rows } = validateAndMapRows(
    json,
    headerMap,
    classes,
    options.existingAdmissionNumbers,
    { defaultClassId: options.defaultClassId }
  );
  return rows;
}

export function toCreateInput(row: ParsedRow): CreateStudentInput | null {
  if (row.errors.length > 0) return null;
  const d = row.data;
  return {
    name: d.name!,
    guardian_name: d.guardian_name!,
    guardian_relationship: d.guardian_relationship!,
    guardian_phone: d.guardian_phone!,
    class_id: d.class_id,
    academic_year_id: d.academic_year_id,
    admission_number: d.admission_number,
    email: d.email,
    phone: d.phone,
    date_of_birth: d.date_of_birth,
    gender: d.gender,
    roll_number: d.roll_number ? parseInt(String(d.roll_number), 10) : undefined,
    address: d.address,
    guardian_email: d.guardian_email,
  };
}
