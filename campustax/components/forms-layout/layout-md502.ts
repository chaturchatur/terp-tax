import { FormSection } from "./layout-1040";

export const layoutMD502: FormSection[] = [
  {
    title: "Filing Information",
    lines: [
      { id: "firstName", label: "First name", kind: "input" },
      { id: "lastName", label: "Last name", kind: "input" },
      { id: "ssn", label: "Social security number", kind: "input" },
      { id: "mdCounty", label: "Maryland county or Baltimore City", kind: "input" },
      { id: "address", label: "Address", kind: "input" },
    ],
  },
  {
    title: "Income",
    lines: [
      { id: "line1_federalAGI", lineNumber: "1", label: "Federal Adjusted Gross Income (from 1040 line 11)", kind: "computed", isCurrency: true },
      { id: "line2_additions", lineNumber: "2", label: "Maryland additions (interest from non-MD obligations, etc.)", kind: "input", isCurrency: true },
      { id: "line3_netIncome", lineNumber: "3", label: "Net income (line 1 + line 2)", kind: "computed", isCurrency: true },
      { id: "line10_subtractions", lineNumber: "10", label: "Maryland subtractions (529 contributions, military pay, etc.)", kind: "input", isCurrency: true },
      { id: "line13_mdAGI", lineNumber: "13", label: "Maryland Adjusted Gross Income (line 3 − line 10)", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Deductions",
    lines: [
      { id: "line17_standardDeduction", lineNumber: "17", label: "Maryland standard deduction (15% of MD AGI, $1,700–$2,550 single)", kind: "computed", isCurrency: true },
      { id: "line20_personalExemption", lineNumber: "20", label: "Personal exemption ($3,200 single for 2024)", kind: "computed", isCurrency: true },
      { id: "line21_netTaxableIncome", lineNumber: "21", label: "Net taxable income (MD AGI − deductions)", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Tax",
    lines: [
      { id: "line22_stateTax", lineNumber: "22", label: "Maryland state tax", kind: "computed", isCurrency: true },
      { id: "line25_localTax", lineNumber: "25", label: "Local/county tax (rate × net taxable income)", kind: "computed", isCurrency: true },
      { id: "countyTaxRate", label: "County tax rate", kind: "computed", isPercent: true },
      { id: "line32_totalTaxAndContributions", lineNumber: "32", label: "Total Maryland tax", kind: "computed", isCurrency: true },
    ],
  },
  {
    title: "Payments",
    lines: [
      { id: "line40_mdWithheld", lineNumber: "40", label: "Maryland tax withheld (W-2 Box 17)", kind: "prefill", source: "w2.stateWithheldBox17", isCurrency: true },
    ],
  },
  {
    title: "Refund or Amount Owed",
    lines: [
      { id: "line50_refund", lineNumber: "50", label: "Refund", kind: "computed", isCurrency: true },
      { id: "line54_amountOwed", lineNumber: "54", label: "Balance due", kind: "computed", isCurrency: true },
    ],
  },
];
