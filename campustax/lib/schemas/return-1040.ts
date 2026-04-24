import { z } from "zod";

export const Return1040Schema = z.object({
  // Filing info
  filingStatus: z.enum(["single", "married_filing_jointly", "married_filing_separately", "head_of_household", "qualifying_surviving_spouse"]),
  firstName: z.string(),
  lastName: z.string(),
  ssn: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),

  // Income (Lines 1-15)
  line1a_wagesSalaries: z.number().default(0),
  line2b_taxableInterest: z.number().default(0),
  line3b_ordinaryDividends: z.number().default(0),
  line4b_iRADistributions: z.number().default(0),
  line5b_pensionsAnnuities: z.number().default(0),
  line7_capitalGainLoss: z.number().default(0),
  line8_otherIncome: z.number().default(0),
  line9_totalIncome: z.number().default(0),

  // Adjustments
  line10_adjustments: z.number().default(0),
  line11_agi: z.number().default(0),

  // Deductions
  line12_standardOrItemized: z.number().default(0),
  line13_qualifiedBusinessDeduction: z.number().default(0),
  line14_totalDeductions: z.number().default(0),
  line15_taxableIncome: z.number().default(0),

  // Tax & Credits (Lines 16-24)
  line16_tax: z.number().default(0),
  line17_amt: z.number().default(0),
  line19_childTaxCredit: z.number().default(0),
  line20_scheduleCredits: z.number().default(0),
  line21_otherTaxes: z.number().default(0),
  line22_totalTax: z.number().default(0),

  // Payments
  line25a_w2FedWithheld: z.number().default(0),
  line26_estimatedTaxPayments: z.number().default(0),
  line27_earnedIncomeCredit: z.number().default(0),
  line28_additionalChildTaxCredit: z.number().default(0),
  line29_aotcRefundable: z.number().default(0),
  line33_totalPayments: z.number().default(0),

  // Refund/Amount Owed
  line34_overpayment: z.number().default(0),
  line35a_refund: z.number().default(0),
  line37_amountOwed: z.number().default(0),

  // AOTC data
  aotcQualified: z.boolean().default(false),
  aotcCreditAmount: z.number().default(0),
});

export type Return1040 = z.infer<typeof Return1040Schema>;
