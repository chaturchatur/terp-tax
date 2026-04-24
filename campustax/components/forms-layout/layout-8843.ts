import { FormSection } from "./layout-1040";

export const layout8843: FormSection[] = [
  {
    title: "Part I — All Exempt Individuals",
    lines: [
      { id: "firstName", label: "First name", kind: "input" },
      { id: "lastName", label: "Last name", kind: "input" },
      { id: "ssn", label: "SSN, ITIN, or 'Applied For'", kind: "input" },
      { id: "countryOfCitizenship", label: "Country of citizenship", kind: "input" },
      { id: "typeOfUSVisa", label: "Type of US visa (e.g. F-1, J-1)", kind: "input" },
      { id: "visaExpirationDate", label: "Visa expiration date", kind: "input" },
      { id: "passportNumber", label: "Passport number", kind: "input" },
      { id: "passportCountry", label: "Country that issued passport", kind: "input" },
    ],
  },
  {
    title: "Part II — Students (F or J Visa)",
    lines: [
      { id: "schoolName", label: "Name of academic institution (University of Maryland)", kind: "input" },
      { id: "schoolAddress", label: "School address (College Park, MD 20742)", kind: "input" },
      { id: "schoolPhone", label: "School phone number", kind: "input" },
      { id: "currentStatusStartDate", label: "Date current period of exempt status began", kind: "input" },
      { id: "exemptYearsPrior2020", label: "Number of prior years claimed as exempt F/J student", kind: "input" },
      { id: "daysCurrentYear", lineNumber: "—", label: "Days present in US during 2024", kind: "input" },
      { id: "daysYear1Prior", lineNumber: "—", label: "Days present in US during 2023", kind: "input" },
      { id: "daysYear2Prior", lineNumber: "—", label: "Days present in US during 2022", kind: "input" },
      { id: "academicTermStart", label: "Academic or professional training term start date", kind: "input" },
      { id: "academicTermEnd", label: "Academic or professional training term end date", kind: "input" },
    ],
  },
];
