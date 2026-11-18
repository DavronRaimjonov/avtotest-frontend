import { z } from "zod";
import { REPORT_MAX, REPORT_MIN } from "@/lib/constants";

// "Xato haqida xabar": backend bilan bir xil cheklov (3–1000 belgi)
export const reportSchema = z.object({
  message: z.string().trim().min(REPORT_MIN).max(REPORT_MAX),
});

export type ReportForm = z.input<typeof reportSchema>;
