import { ReturnMD502 } from "../schemas/return-md502";
import { getLocalRate } from "./md-local-rates";

// MD 2024 state tax brackets — single filer
const MD_STATE_BRACKETS_SINGLE = [
  { upTo: 1000, rate: 0.02 },
  { upTo: 2000, rate: 0.03 },
  { upTo: 3000, rate: 0.04 },
  { upTo: 100000, rate: 0.0475 },
  { upTo: 125000, rate: 0.05 },
  { upTo: 150000, rate: 0.0525 },
  { upTo: 250000, rate: 0.055 },
  { upTo: Infinity, rate: 0.0575 },
];

export function computeMDStateTax(taxableIncome: number): number {
  let tax = 0;
  let prev = 0;
  for (const bracket of MD_STATE_BRACKETS_SINGLE) {
    if (taxableIncome <= bracket.upTo) {
      tax += (taxableIncome - prev) * bracket.rate;
      break;
    }
    tax += (bracket.upTo - prev) * bracket.rate;
    prev = bracket.upTo;
  }
  return Math.round(tax * 100) / 100;
}

// MD standard deduction: 15% of MD AGI, min $1,700 max $2,550 (single 2024)
function mdStandardDeduction(mdAGI: number): number {
  const deduction = Math.round(mdAGI * 0.15);
  return Math.min(Math.max(deduction, 1700), 2550);
}

export interface ComputeMD502Input {
  federalAGI: number;
  mdWithheld: number;
  county: string;
  filingStatus: "single" | "married_filing_jointly" | "married_filing_separately" | "head_of_household" | "dependent";
  mdSubtractions?: number; // e.g. 529 contributions, military pay
  mdAdditions?: number;
}

export function computeMD502(input: ComputeMD502Input): Partial<ReturnMD502> {
  const { federalAGI, mdWithheld, county, filingStatus, mdSubtractions = 0, mdAdditions = 0 } = input;

  const netIncome = federalAGI + mdAdditions;
  const mdAGI = Math.max(0, netIncome - mdSubtractions);

  const standardDeduction = mdStandardDeduction(mdAGI);
  // Personal exemption: $3,200 for single (2024)
  const personalExemption = 3200;
  const netTaxableIncome = Math.max(0, mdAGI - standardDeduction - personalExemption);

  const stateTax = computeMDStateTax(netTaxableIncome);
  const localRate = getLocalRate(county);
  const localTax = Math.round(netTaxableIncome * localRate * 100) / 100;
  const totalTax = stateTax + localTax;

  const refund = Math.max(0, mdWithheld - totalTax);
  const amountOwed = Math.max(0, totalTax - mdWithheld);

  return {
    filingStatus,
    mdCounty: county,
    line1_federalAGI: federalAGI,
    line2_additions: mdAdditions,
    line3_netIncome: netIncome,
    line10_subtractions: mdSubtractions,
    line13_mdAGI: mdAGI,
    line17_standardDeduction: standardDeduction,
    line20_personalExemption: personalExemption,
    line21_netTaxableIncome: netTaxableIncome,
    line22_stateTax: stateTax,
    line25_localTax: localTax,
    line32_totalTaxAndContributions: totalTax,
    line40_mdWithheld: mdWithheld,
    line50_refund: refund,
    line54_amountOwed: amountOwed,
    countyTaxRate: localRate,
  };
}
