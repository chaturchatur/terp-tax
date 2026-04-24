import { z } from "zod";

export const Return1040NRSchema = z.object({
  // Filing info
  firstName: z.string(),
  lastName: z.string(),
  ssn: z.string().optional(),
  itin: z.string().optional(),
  countryOfCitizenship: z.string(),
  visaType: z.string(),
  usAddress: z.string().optional(),

  // Income
  line1a_wagesSalaries: z.number().default(0), // effectively connected wages
  line2_taxableScholarships: z.number().default(0),
  line8_otherIncome: z.number().default(0),
  line9_totalEffectivelyConnected: z.number().default(0),

  // Deductions
  line12_standardDeduction: z.number().default(0), // NR cannot claim standard deduction except treaty
  line15_taxableIncome: z.number().default(0),

  // Tax
  line16_tax: z.number().default(0),
  line23_totalTax: z.number().default(0),

  // Payments
  line25a_w2FedWithheld: z.number().default(0),
  line26_1042sFedWithheld: z.number().default(0),
  line33_totalPayments: z.number().default(0),

  // Refund/Owed
  line35_refund: z.number().default(0),
  line37_amountOwed: z.number().default(0),

  // Treaty
  treatyCountry: z.string().optional(),
  treatyArticle: z.string().optional(),
  treatyExemptAmount: z.number().default(0),
});

export type Return1040NR = z.infer<typeof Return1040NRSchema>;
