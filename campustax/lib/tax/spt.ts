// Substantial Presence Test — IRS §7701(b)
// F-1 and J-1 student visa holders are "exempt individuals" for up to 5 calendar years
// (counting from any year in which they were present as a student).
// Once beyond 5 exempt years they count days under the SPT formula.

export interface SPTInput {
  visaType: "F-1" | "J-1" | "H-1B" | "other";
  exemptYearsUsed: number; // calendar years already used as F-1/J-1 student
  daysCurrentYear: number;
  daysPriorYear1: number;
  daysPriorYear2: number;
}

export interface SPTResult {
  isResident: boolean;
  isExemptIndividual: boolean;
  exemptYearsRemaining: number;
  sptDays: number;
  explanation: string;
}

export function computeSPT(input: SPTInput): SPTResult {
  const { visaType, exemptYearsUsed, daysCurrentYear, daysPriorYear1, daysPriorYear2 } = input;

  // F-1/J-1 students are exempt for 5 calendar years
  if ((visaType === "F-1" || visaType === "J-1") && exemptYearsUsed < 5) {
    return {
      isResident: false,
      isExemptIndividual: true,
      exemptYearsRemaining: 5 - exemptYearsUsed,
      sptDays: 0,
      explanation: `As an ${visaType} student with ${exemptYearsUsed} prior exempt year(s), you are an "exempt individual" and do not count days toward the Substantial Presence Test. You have ${5 - exemptYearsUsed} exempt year(s) remaining.`,
    };
  }

  // SPT formula: current year days + 1/3 prior year + 1/6 two years prior
  const sptDays =
    daysCurrentYear +
    Math.floor(daysPriorYear1 / 3) +
    Math.floor(daysPriorYear2 / 6);

  const isResident = sptDays >= 183 && daysCurrentYear >= 31;

  return {
    isResident,
    isExemptIndividual: false,
    exemptYearsRemaining: 0,
    sptDays,
    explanation: isResident
      ? `Your SPT count is ${sptDays} days (${daysCurrentYear} + ${Math.floor(daysPriorYear1 / 3)} + ${Math.floor(daysPriorYear2 / 6)}), which meets the 183-day threshold. You are a US tax resident and should file Form 1040.`
      : `Your SPT count is ${sptDays} days (${daysCurrentYear} + ${Math.floor(daysPriorYear1 / 3)} + ${Math.floor(daysPriorYear2 / 6)}), which is below 183 days. You are a non-resident alien and should file Form 1040-NR.`,
  };
}
