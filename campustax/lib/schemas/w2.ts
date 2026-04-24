import { z } from "zod";

export const W2Schema = z.object({
  employerName: z.string().describe("Box: Employer name"),
  employerEIN: z.string().describe("Box b: Employer EIN"),
  employeeName: z.string().describe("Box e: Employee name"),
  employeeSSN: z.string().describe("Box a: Employee SSN"),
  employeeAddress: z.string().optional(),
  // Financial boxes
  wagesBox1: z.number().describe("Box 1: Wages, tips, other compensation"),
  federalWithheldBox2: z.number().describe("Box 2: Federal income tax withheld"),
  socialSecurityWagesBox3: z.number().describe("Box 3: Social security wages"),
  socialSecurityWithheldBox4: z.number().describe("Box 4: Social security tax withheld"),
  medicareWagesBox5: z.number().describe("Box 5: Medicare wages and tips"),
  medicareWithheldBox6: z.number().describe("Box 6: Medicare tax withheld"),
  // State boxes
  stateBox15: z.string().optional().describe("Box 15: State"),
  stateWagesBox16: z.number().optional().describe("Box 16: State wages, tips"),
  stateWithheldBox17: z.number().optional().describe("Box 17: State income tax withheld"),
  localWagesBox18: z.number().optional().describe("Box 18: Local wages, tips"),
  localWithheldBox19: z.number().optional().describe("Box 19: Local income tax withheld"),
  localityBox20: z.string().optional().describe("Box 20: Locality name"),
});

export type W2 = z.infer<typeof W2Schema>;
