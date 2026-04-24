import { z } from "zod";

export const Form1042SSchema = z.object({
  incomeCode: z.string().describe("Box 1: Income code"),
  grossIncome: z.number().describe("Box 2: Gross income"),
  chapter3ExemptionCode: z.string().optional().describe("Box 3a: Chapter 3 exemption code"),
  taxRate: z.number().optional().describe("Box 3b: Tax rate (%)"),
  chapter4ExemptionCode: z.string().optional().describe("Box 4a: Chapter 4 exemption code"),
  withholdingAllowance: z.number().optional().describe("Box 6: Withholding allowance"),
  netIncome: z.number().optional().describe("Box 7: Net income"),
  federalTaxWithheld: z.number().describe("Box 8a: Federal tax withheld"),
  stateTaxWithheld: z.number().optional().describe("Box 21: State income tax withheld"),
  countryOfResidence: z.string().describe("Box 13h: Country code of recipient"),
  treatyCountry: z.string().optional().describe("Box 13j: Treaty country"),
  treatyArticle: z.string().optional().describe("Box 13k: Treaty article number"),
  payerName: z.string().describe("Withholding agent name"),
  recipientName: z.string().describe("Recipient name"),
});

export type Form1042S = z.infer<typeof Form1042SSchema>;
