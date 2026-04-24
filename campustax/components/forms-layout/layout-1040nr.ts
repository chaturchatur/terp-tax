import { FormSection } from "./layout-1040";

export const layout1040NR: FormSection[] = [
  {
    title: "Filing Information",
    lines: [
      { id: "firstName", label: "First name", kind: "input" },
      { id: "lastName", label: "Last name", kind: "input" },
      { id: "ssn", label: "SSN or ITIN", kind: "input" },
      { id: "countryOfCitizenship", label: "Country of citizenship", kind: "input" },
      { id: "visaType", label: "Visa type (e.g. F-1, J-1)", kind: "input" },
    ],
  },
  {
    title: "Income — Effectively Connected with US Trade or Business",
    lines: [
      { id: "line1a_wagesSalaries", lineNumber: "1a", label: "Wages, salaries, tips (from W-2)", kind: "prefill", source: "w2.wagesBox1", isCurrency: true },
      { id: "line2_taxableScholarships", lineNumber: "2", label: "Taxable scholarships and fellowship grants", kind: "input", isCurrency: true },
      { id: "line8_otherIncome", lineNumber: "8", label: "Other income (from 1042-S)", kind: "prefill", source: "form1042s.grossIncome", isCurrency: true },
      { id: "line9_totalEffectivelyConnected", lineNumber: "9", label: "Total effectively connected income", kind: "computed", computeFrom: ["line1a_wagesSalaries", "line2_taxableScholarships", "line8_otherIncome"], isCurrency: true },
    ],
  },
  {
    title: "Treaty Exemption",
    lines: [
      { id: "treatyCountry", label: "Treaty country", kind: "input" },
      { id: "treatyArticle", label: "Treaty article number", kind: "input" },
      { id: "treatyExemptAmount", label: "Treaty-exempt income amount", kind: "input", isCurrency: true },
    ],
  },
  {
    title: "Deductions",
    lines: [
      { id: "line12_standardDeduction", lineNumber: "12", label: "Personal exemption ($5,050 for 2024)", kind: "computed", isCurrency: true },
      { id: "line15_taxableIncome", lineNumber: "15", label: "Taxable income", kind: "computed", computeFrom: ["line9_totalEffectivelyConnected", "line12_standardDeduction", "treatyExemptAmount"], isCurrency: true },
    ],
  },
  {
    title: "Tax and Credits",
    lines: [
      { id: "line16_tax", lineNumber: "16", label: "Tax (from Tax Table)", kind: "computed", isCurrency: true },
      { id: "line23_totalTax", lineNumber: "23", label: "Total tax", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Payments",
    lines: [
      { id: "line25a_w2FedWithheld", lineNumber: "25a", label: "Federal tax withheld (W-2 Box 2)", kind: "prefill", source: "w2.federalWithheldBox2", isCurrency: true },
      { id: "line26_1042sFedWithheld", lineNumber: "26", label: "Federal tax withheld (1042-S Box 8a)", kind: "prefill", source: "form1042s.federalTaxWithheld", isCurrency: true },
      { id: "line33_totalPayments", lineNumber: "33", label: "Total payments", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Refund or Amount Owed",
    lines: [
      { id: "line35_refund", lineNumber: "35", label: "Refund", kind: "computed", isCurrency: true },
      { id: "line37_amountOwed", lineNumber: "37", label: "Amount you owe", kind: "computed", isCurrency: true },
    ],
  },
];
