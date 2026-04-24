import { ReturnMD505 } from "../schemas/return-md505";
import { computeMDStateTax } from "./compute-md502";

export interface ComputeMD505Input {
  federalAGI: number;
  mdSourceIncome: number; // wages from MD employer only
  mdWithheld: number;
  filingStatus: "single" | "married_filing_jointly" | "married_filing_separately" | "head_of_household";
  countryOfResidence: string;
}

export function computeMD505(input: ComputeMD505Input): Partial<ReturnMD505> {
  const { federalAGI, mdSourceIncome, mdWithheld, filingStatus, countryOfResidence } = input;

  // Non-residents: taxable MD income = MD-source income (no county/local tax)
  // MD 505 applies state brackets to MD-source income only
  // Personal exemption: $3,200 single (same as resident)
  const personalExemption = 3200;
  const mdTaxableIncome = Math.max(0, mdSourceIncome - personalExemption);
  const stateTax = computeMDStateTax(mdTaxableIncome);

  const refund = Math.max(0, mdWithheld - stateTax);
  const amountOwed = Math.max(0, stateTax - mdWithheld);

  return {
    filingStatus,
    countryOfResidence,
    line1_federalAGI: federalAGI,
    line6_mdSourceIncome: mdSourceIncome,
    line13_mdTaxableIncome: mdTaxableIncome,
    line14_mdStateTax: stateTax,
    line20_mdWithheld: mdWithheld,
    line24_refund: refund,
    line28_amountOwed: amountOwed,
  };
}
