import { z } from "zod";

export const Form1098TSchema = z.object({
  institutionName: z.string().describe("Filer: Institution name"),
  institutionEIN: z.string().describe("Filer: Institution EIN"),
  studentName: z.string().describe("Student name"),
  studentSSN: z.string().describe("Student SSN/TIN"),
  tuitionBilledBox1: z.number().describe("Box 1: Payments received for qualified tuition"),
  adjustmentsBox4: z.number().optional().describe("Box 4: Adjustments made for prior year"),
  scholarshipsBox5: z.number().optional().describe("Box 5: Scholarships or grants"),
  adjustmentsScholarshipsBox6: z.number().optional().describe("Box 6: Adjustments to scholarships for prior year"),
  halfTimeBox8: z.boolean().optional().describe("Box 8: At least half-time student"),
  graduateBox9: z.boolean().optional().describe("Box 9: Graduate student"),
});

export type Form1098T = z.infer<typeof Form1098TSchema>;
