import { z } from "zod";

export const ReturnMD502Schema = z.object({
  // Filing info
  filingStatus: z.enum(["single", "married_filing_jointly", "married_filing_separately", "head_of_household", "dependent"]),
  firstName: z.string(),
  lastName: z.string(),
  ssn: z.string(),
  mdCounty: z.string().default("Prince George's"),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),

  // Income
  line1_federalAGI: z.number().default(0),
  line2_additions: z.number().default(0), // MD-specific additions
  line3_netIncome: z.number().default(0),
  line10_subtractions: z.number().default(0), // MD subtractions (529, etc.)
  line13_mdAGI: z.number().default(0),

  // Deductions
  line17_standardDeduction: z.number().default(0), // 15% of MD AGI, $1,700–$2,550 single
  line20_personalExemption: z.number().default(0),
  line21_netTaxableIncome: z.number().default(0),

  // Tax
  line22_stateTax: z.number().default(0),
  line25_localTax: z.number().default(0), // county/local rate × taxable net income
  line32_totalTaxAndContributions: z.number().default(0),

  // Credits
  line26_povertyLevelCredit: z.number().default(0),
  line27_incomeFromOtherState: z.number().default(0),

  // Payments
  line40_mdWithheld: z.number().default(0),

  // Refund/Owed
  line50_refund: z.number().default(0),
  line54_amountOwed: z.number().default(0),

  // Local tax rate used
  countyTaxRate: z.number().default(0.032), // Prince George's default
});

export type ReturnMD502 = z.infer<typeof ReturnMD502Schema>;
