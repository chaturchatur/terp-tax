import { FormSection } from "./layout-1040";

export const layoutMD505: FormSection[] = [
  {
    title: "Filing Information",
    lines: [
      { id: "firstName", label: "First name", kind: "input" },
      { id: "lastName", label: "Last name", kind: "input" },
      { id: "ssn", label: "SSN or ITIN", kind: "input" },
      { id: "countryOfResidence", label: "Country of permanent residence", kind: "input" },
      { id: "usAddress", label: "US address during 2024", kind: "input" },
    ],
  },
  {
    title: "Income",
    lines: [
      { id: "line1_federalAGI", lineNumber: "1", label: "Federal Adjusted Gross Income (from 1040-NR)", kind: "computed", isCurrency: true },
      { id: "line6_mdSourceIncome", lineNumber: "6", label: "Maryland-source income (UMD wages, etc.)", kind: "prefill", source: "w2.wagesBox1", isCurrency: true },
      { id: "line13_mdTaxableIncome", lineNumber: "13", label: "Maryland taxable net income (MD income − exemption)", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Tax",
    lines: [
      { id: "line14_mdStateTax", lineNumber: "14", label: "Maryland state tax (non-residents pay state only, no county tax)", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Payments",
    lines: [
      { id: "line20_mdWithheld", lineNumber: "20", label: "Maryland tax withheld (W-2 Box 17)", kind: "prefill", source: "w2.stateWithheldBox17", isCurrency: true },
    ],
  },
  {
    title: "Refund or Amount Owed",
    lines: [
      { id: "line24_refund", lineNumber: "24", label: "Refund", kind: "computed", isCurrency: true },
      { id: "line28_amountOwed", lineNumber: "28", label: "Balance due", kind: "computed", isCurrency: true },
    ],
  },
];
