import { W2 } from "../schemas/w2";
import { Form1098T } from "../schemas/1098t";
import { Return1040 } from "../schemas/return-1040";

// 2024 tax year brackets — single filer
const TAX_BRACKETS_SINGLE_2024 = [
  { upTo: 11600, rate: 0.10 },
  { upTo: 47150, rate: 0.12 },
  { upTo: 100525, rate: 0.22 },
  { upTo: 191950, rate: 0.24 },
  { upTo: 243725, rate: 0.32 },
  { upTo: 609350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION_2024 = {
  single: 14600,
  married_filing_jointly: 29200,
  married_filing_separately: 14600,
  head_of_household: 21900,
  qualifying_surviving_spouse: 29200,
};

export function computeFederalTax(taxableIncome: number): number {
  let tax = 0;
  let prev = 0;
  for (const bracket of TAX_BRACKETS_SINGLE_2024) {
    if (taxableIncome <= bracket.upTo) {
      tax += (taxableIncome - prev) * bracket.rate;
      break;
    }
    tax += (bracket.upTo - prev) * bracket.rate;
    prev = bracket.upTo;
  }
  return Math.round(tax * 100) / 100;
}

export interface Compute1040Input {
  w2?: W2;
  form1098t?: Form1098T;
  filingStatus: keyof typeof STANDARD_DEDUCTION_2024;
  taxableScholarships?: number; // portion of scholarships not used for tuition
  otherIncome?: number;
}

export function compute1040(input: Compute1040Input): Partial<Return1040> {
  const { w2, form1098t, filingStatus, taxableScholarships = 0, otherIncome = 0 } = input;

  const wages = w2?.wagesBox1 ?? 0;
  const fedWithheld = w2?.federalWithheldBox2 ?? 0;

  const totalIncome = wages + taxableScholarships + otherIncome;
  const agi = totalIncome; // students rarely have above-line deductions

  const standardDeduction = STANDARD_DEDUCTION_2024[filingStatus];
  const taxableIncome = Math.max(0, agi - standardDeduction);
  const federalTax = computeFederalTax(taxableIncome);

  // AOTC: 100% of first $2k + 25% of next $2k qualified education expenses, max $2,500
  // Qualified expenses = tuition paid - scholarships
  let aotcCredit = 0;
  if (form1098t) {
    const qualifiedExpenses = Math.max(0, (form1098t.tuitionBilledBox1 ?? 0) - (form1098t.scholarshipsBox5 ?? 0));
    if (qualifiedExpenses > 0) {
      const first2k = Math.min(qualifiedExpenses, 2000);
      const next2k = Math.min(Math.max(0, qualifiedExpenses - 2000), 2000);
      aotcCredit = Math.round((first2k + next2k * 0.25) * 100) / 100;
    }
  }

  // 40% of AOTC is refundable (American Opportunity Credit)
  const aotcRefundable = Math.round(aotcCredit * 0.4 * 100) / 100;
  const aotcNonRefundable = aotcCredit - aotcRefundable;

  const totalTax = Math.max(0, federalTax - aotcNonRefundable);
  const totalPayments = fedWithheld + aotcRefundable;
  const refund = Math.max(0, totalPayments - totalTax);
  const amountOwed = Math.max(0, totalTax - totalPayments);

  return {
    line1a_wagesSalaries: wages,
    line9_totalIncome: totalIncome,
    line11_agi: agi,
    line12_standardOrItemized: standardDeduction,
    line15_taxableIncome: taxableIncome,
    line16_tax: federalTax,
    line19_childTaxCredit: aotcNonRefundable,
    line22_totalTax: totalTax,
    line25a_w2FedWithheld: fedWithheld,
    line29_aotcRefundable: aotcRefundable,
    line33_totalPayments: totalPayments,
    line35a_refund: refund,
    line37_amountOwed: amountOwed,
    aotcQualified: aotcCredit > 0,
    aotcCreditAmount: aotcCredit,
    filingStatus,
  };
}
