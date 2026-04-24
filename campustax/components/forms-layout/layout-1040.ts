export type FieldKind = "input" | "prefill" | "computed" | "header" | "checkbox";

export interface FormLine {
  id: string;
  lineNumber?: string;
  label: string;
  kind: FieldKind;
  source?: string; // e.g. "w2.wagesBox1"
  computeFrom?: string[]; // ids of lines this depends on
  isCurrency?: boolean;
  isPercent?: boolean;
}

export interface FormSection {
  title: string;
  lines: FormLine[];
}

export const layout1040: FormSection[] = [
  {
    title: "Filing Information",
    lines: [
      { id: "firstName", label: "First name", kind: "input" },
      { id: "lastName", label: "Last name", kind: "input" },
      { id: "ssn", label: "Social security number", kind: "input" },
      { id: "address", label: "Address", kind: "input" },
      { id: "city", label: "City, town, or post office", kind: "input" },
      { id: "state", label: "State", kind: "input" },
      { id: "zip", label: "ZIP code", kind: "input" },
      { id: "filingStatus", label: "Filing status", kind: "input" },
    ],
  },
  {
    title: "Income",
    lines: [
      { id: "line1a_wagesSalaries", lineNumber: "1a", label: "Wages, salaries, tips, etc.", kind: "prefill", source: "w2.wagesBox1", isCurrency: true },
      { id: "line2b_taxableInterest", lineNumber: "2b", label: "Taxable interest", kind: "input", isCurrency: true },
      { id: "line3b_ordinaryDividends", lineNumber: "3b", label: "Ordinary dividends", kind: "input", isCurrency: true },
      { id: "line7_capitalGainLoss", lineNumber: "7", label: "Capital gain or (loss)", kind: "input", isCurrency: true },
      { id: "line8_otherIncome", lineNumber: "8", label: "Other income (taxable scholarships, etc.)", kind: "input", isCurrency: true },
      { id: "line9_totalIncome", lineNumber: "9", label: "Total income. Add lines 1z through 8", kind: "computed", computeFrom: ["line1a_wagesSalaries", "line2b_taxableInterest", "line3b_ordinaryDividends", "line7_capitalGainLoss", "line8_otherIncome"], isCurrency: true },
      { id: "line10_adjustments", lineNumber: "10", label: "Adjustments to income", kind: "input", isCurrency: true },
      { id: "line11_agi", lineNumber: "11", label: "Adjusted Gross Income", kind: "computed", computeFrom: ["line9_totalIncome", "line10_adjustments"], isCurrency: true },
    ],
  },
  {
    title: "Deductions",
    lines: [
      { id: "line12_standardOrItemized", lineNumber: "12", label: "Standard deduction ($14,600 single / $29,200 MFJ)", kind: "computed", isCurrency: true },
      { id: "line13_qualifiedBusinessDeduction", lineNumber: "13", label: "Qualified business income deduction", kind: "input", isCurrency: true },
      { id: "line15_taxableIncome", lineNumber: "15", label: "Taxable income", kind: "computed", computeFrom: ["line11_agi", "line12_standardOrItemized", "line13_qualifiedBusinessDeduction"], isCurrency: true },
    ],
  },
  {
    title: "Tax and Credits",
    lines: [
      { id: "line16_tax", lineNumber: "16", label: "Tax (from Tax Table)", kind: "computed", isCurrency: true },
      { id: "line19_childTaxCredit", lineNumber: "19", label: "Child tax credit / American Opportunity Credit (non-refundable)", kind: "computed", isCurrency: true },
      { id: "line22_totalTax", lineNumber: "22", label: "Total tax", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Payments",
    lines: [
      { id: "line25a_w2FedWithheld", lineNumber: "25a", label: "Federal income tax withheld (from W-2)", kind: "prefill", source: "w2.federalWithheldBox2", isCurrency: true },
      { id: "line27_earnedIncomeCredit", lineNumber: "27", label: "Earned income credit (EIC)", kind: "input", isCurrency: true },
      { id: "line29_aotcRefundable", lineNumber: "29", label: "American Opportunity Credit (refundable portion, 40%)", kind: "computed", isCurrency: true },
      { id: "line33_totalPayments", lineNumber: "33", label: "Total payments", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Refund or Amount Owed",
    lines: [
      { id: "line35a_refund", lineNumber: "35a", label: "Refund", kind: "computed", isCurrency: true },
      { id: "line37_amountOwed", lineNumber: "37", label: "Amount you owe", kind: "computed", isCurrency: true },
    ],
  },
];
