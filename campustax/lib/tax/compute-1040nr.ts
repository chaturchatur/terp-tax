import { W2 } from "../schemas/w2";
import { Form1042S } from "../schemas/1042s";
import { Return1040NR } from "../schemas/return-1040nr";

// 2024 NR tax brackets for effectively connected income — single
const TAX_BRACKETS_NR_2024 = [
  { upTo: 11600, rate: 0.10 },
  { upTo: 47150, rate: 0.12 },
  { upTo: 100525, rate: 0.22 },
  { upTo: 191950, rate: 0.24 },
  { upTo: 243725, rate: 0.32 },
  { upTo: 609350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

export function computeNRFederalTax(taxableIncome: number): number {
  let tax = 0;
  let prev = 0;
  for (const bracket of TAX_BRACKETS_NR_2024) {
    if (taxableIncome <= bracket.upTo) {
      tax += (taxableIncome - prev) * bracket.rate;
      break;
    }
    tax += (bracket.upTo - prev) * bracket.rate;
    prev = bracket.upTo;
  }
  return Math.round(tax * 100) / 100;
}

// NRAs can claim one personal exemption ($5,050 for 2024) — limited to residents of certain treaty countries
// For simplicity: always allow the $5,050 single personal exemption for students
const NR_PERSONAL_EXEMPTION_2024 = 5050;

export interface Compute1040NRInput {
  w2?: W2;
  form1042s?: Form1042S;
  countryOfCitizenship: string;
  treatyCountry?: string;
  treatyArticle?: string;
  treatyExemptAmount?: number;
}

export function compute1040NR(input: Compute1040NRInput): Partial<Return1040NR> {
  const { w2, form1042s, treatyExemptAmount = 0 } = input;

  const wages = w2?.wagesBox1 ?? 0;
  const fedWithheldW2 = w2?.federalWithheldBox2 ?? 0;
  const grossFrom1042s = form1042s?.grossIncome ?? 0;
  const fedWithheld1042s = form1042s?.federalTaxWithheld ?? 0;

  // Effectively connected income
  const totalEffectivelyConnected = wages + grossFrom1042s - treatyExemptAmount;
  const personalExemption = NR_PERSONAL_EXEMPTION_2024;
  const taxableIncome = Math.max(0, totalEffectivelyConnected - personalExemption);
  const federalTax = computeNRFederalTax(taxableIncome);

  const totalPayments = fedWithheldW2 + fedWithheld1042s;
  const refund = Math.max(0, totalPayments - federalTax);
  const amountOwed = Math.max(0, federalTax - totalPayments);

  return {
    line1a_wagesSalaries: wages,
    line8_otherIncome: grossFrom1042s,
    line9_totalEffectivelyConnected: totalEffectivelyConnected,
    line12_standardDeduction: personalExemption,
    line15_taxableIncome: taxableIncome,
    line16_tax: federalTax,
    line23_totalTax: federalTax,
    line25a_w2FedWithheld: fedWithheldW2,
    line26_1042sFedWithheld: fedWithheld1042s,
    line33_totalPayments: totalPayments,
    line35_refund: refund,
    line37_amountOwed: amountOwed,
    treatyExemptAmount,
  };
}
