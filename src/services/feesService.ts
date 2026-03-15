import { apiGet, apiPost } from "@/services/api";

export interface FeeInvoice {
  id: string;
  student_id: string;
  invoice_number: string;
  academic_year: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  total_discount: number;
  total_fine: number;
  total_amount: number;
  status: "draft" | "unpaid" | "partial" | "paid" | "cancelled";
  amount_paid: number;
  remaining_balance: number;
  created_at: string;
}

export const feesService = {
  getInvoices: async (params?: {
    student_id?: string;
    status?: string;
    academic_year?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.student_id) q.set("student_id", params.student_id);
    if (params?.status) q.set("status", params.status);
    if (params?.academic_year) q.set("academic_year", params.academic_year);
    const url = `/api/fees/invoices${q.toString() ? `?${q}` : ""}`;
    const res = await apiGet<{ invoices: FeeInvoice[] }>(url);
    return res?.invoices ?? [];
  },

  getInvoice: async (id: string) =>
    apiGet<FeeInvoice>(`/api/fees/invoices/${id}`),

  sendReminder: async (invoiceId: string) =>
    apiPost(`/api/fees/invoices/${invoiceId}/send-reminder`, {}),
};
