import { z } from "zod";

export const Form8843Schema = z.object({
  // Part I — all exempt individuals
  firstName: z.string(),
  lastName: z.string(),
  ssn: z.string().optional(),
  itin: z.string().optional(),
  countryOfCitizenship: z.string(),
  typeOfUSVisa: z.string(),
  visaExpirationDate: z.string().optional(),
  passportNumber: z.string().optional(),
  passportCountry: z.string().optional(),

  // Part II — students (F or J)
  schoolName: z.string().optional(),
  schoolAddress: z.string().optional(),
  schoolCity: z.string().optional(),
  schoolState: z.string().optional(),
  schoolZip: z.string().optional(),
  schoolPhone: z.string().optional(),
  currentStatusStartDate: z.string().optional(),
  exemptYearsPrior2020: z.number().optional(),
  // Days present in US each year
  daysCurrentYear: z.number().optional(),
  daysYear1Prior: z.number().optional(),
  daysYear2Prior: z.number().optional(),
  // Academic term dates
  academicTermStart: z.string().optional(),
  academicTermEnd: z.string().optional(),
});

export type Form8843 = z.infer<typeof Form8843Schema>;
