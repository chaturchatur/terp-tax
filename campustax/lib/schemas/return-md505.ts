import { z } from "zod";

export const ReturnMD505Schema = z.object({
  // Filing info
  filingStatus: z.enum(["single", "married_filing_jointly", "married_filing_separately", "head_of_household"]),
  firstName: z.string(),
  lastName: z.string(),
  ssn: z.string().optional(),
  itin: z.string().optional(),
  countryOfResidence: z.string(),
  usAddress: z.string().optional(),

  // Income — MD-source only
  line1_federalAGI: z.number().default(0),
  line6_mdSourceIncome: z.number().default(0), // wages from MD employer
  line13_mdTaxableIncome: z.number().default(0),

  // Tax
  line14_mdStateTax: z.number().default(0),
  // NR files 505 — no local/county tax (non-residents pay state only)

  // Payments
  line20_mdWithheld: z.number().default(0),

  // Refund/Owed
  line24_refund: z.number().default(0),
  line28_amountOwed: z.number().default(0),
});

export type ReturnMD505 = z.infer<typeof ReturnMD505Schema>;
