"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import type { Student, CreateStudentInput } from "@/types/student";
import type { ClassItem } from "@/services/classesService";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  guardian_name: z.string().min(1, "Guardian name is required"),
  guardian_relationship: z.string().min(1, "Relationship is required"),
  guardian_phone: z.string().min(1, "Guardian phone is required"),
  guardian_email: z.string().email("Invalid email").optional().or(z.literal("")),
  class_id: z.string().optional(),
  admission_number: z.string().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Student;
  classes: ClassItem[];
  onSubmit: (data: CreateStudentInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function StudentForm({
  initialData,
  classes,
  onSubmit,
  onCancel,
  submitLabel = "Create Student",
}: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email ?? "",
          guardian_name: initialData.guardian_name ?? "",
          guardian_relationship: initialData.guardian_relationship ?? "",
          guardian_phone: initialData.guardian_phone ?? "",
          guardian_email: initialData.guardian_email ?? "",
          class_id: initialData.class_id ?? "",
          admission_number: initialData.admission_number ?? "",
          phone: initialData.phone ?? "",
          date_of_birth: initialData.date_of_birth ?? "",
          gender: initialData.gender ?? "",
          address: initialData.address ?? "",
        }
      : {
          name: "",
          email: "",
          guardian_name: "",
          guardian_relationship: "",
          guardian_phone: "",
          guardian_email: "",
          class_id: "",
          admission_number: "",
          phone: "",
          date_of_birth: "",
          gender: "",
          address: "",
        },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CreateStudentInput = {
      name: values.name,
      guardian_name: values.guardian_name,
      guardian_relationship: values.guardian_relationship,
      guardian_phone: values.guardian_phone,
    };
    if (values.email) payload.email = values.email;
    if (values.guardian_email) payload.guardian_email = values.guardian_email;
    if (values.class_id) payload.class_id = values.class_id;
    if (values.admission_number) payload.admission_number = values.admission_number;
    if (values.phone) payload.phone = values.phone;
    if (values.date_of_birth) payload.date_of_birth = values.date_of_birth;
    if (values.gender) payload.gender = values.gender;
    if (values.address) payload.address = values.address;
    if (!values.class_id) {
      // Backend requires class_id or academic_year_id - pick first class if none selected
      if (classes.length > 0) payload.class_id = classes[0].id;
    }
    await onSubmit(payload);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Student full name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="student@example.com"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admission_number">Admission Number</Label>
          <Input
            id="admission_number"
            {...form.register("admission_number")}
            placeholder="Auto-generated if blank"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="class_id">Class</Label>
          <Select
            value={form.watch("class_id") || ""}
            onValueChange={(v) => form.setValue("class_id", v)}
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
          <Label htmlFor="guardian_name">Guardian Name *</Label>
          <Input
            id="guardian_name"
            {...form.register("guardian_name")}
            placeholder="Parent/Guardian name"
          />
          {form.formState.errors.guardian_name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.guardian_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardian_relationship">Relationship *</Label>
          <Input
            id="guardian_relationship"
            {...form.register("guardian_relationship")}
            placeholder="Father / Mother / Guardian"
          />
          {form.formState.errors.guardian_relationship && (
            <p className="text-sm text-destructive">
              {form.formState.errors.guardian_relationship.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardian_phone">Guardian Phone *</Label>
          <Input
            id="guardian_phone"
            {...form.register("guardian_phone")}
            placeholder="+91 9876543210"
          />
          {form.formState.errors.guardian_phone && (
            <p className="text-sm text-destructive">
              {form.formState.errors.guardian_phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardian_email">Guardian Email</Label>
          <Input
            id="guardian_email"
            type="email"
            {...form.register("guardian_email")}
            placeholder="guardian@example.com"
          />
          {form.formState.errors.guardian_email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.guardian_email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Student Phone</Label>
          <Input id="phone" {...form.register("phone")} placeholder="Optional" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            {...form.register("date_of_birth")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={form.watch("gender") || ""}
            onValueChange={(v) => form.setValue("gender", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...form.register("address")}
          placeholder="Full address"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
