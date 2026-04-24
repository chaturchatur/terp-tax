import { create } from "zustand";
import { W2 } from "./schemas/w2";
import { Form1098T } from "./schemas/1098t";
import { Form1042S } from "./schemas/1042s";

export type FilerType = "resident" | "nonresident" | null;

export interface ResidencyAnswers {
  visaType: "F-1" | "J-1" | "H-1B" | "citizen" | "greencard" | "other";
  exemptYearsUsed: number;
  daysCurrentYear: number;
  daysPriorYear1: number;
  daysPriorYear2: number;
  countryOfCitizenship: string;
}

export interface FormValues {
  [formId: string]: {
    [lineId: string]: number | string | boolean;
  };
}

interface TaxStore {
  // Step 1: filer type
  filerType: FilerType;
  setFilerType: (t: FilerType) => void;

  // Step 2: residency
  residencyAnswers: Partial<ResidencyAnswers>;
  setResidencyAnswers: (a: Partial<ResidencyAnswers>) => void;

  // Step 3: uploaded documents
  w2: W2 | null;
  form1098t: Form1098T | null;
  form1042s: Form1042S | null;
  setW2: (w: W2 | null) => void;
  set1098T: (f: Form1098T | null) => void;
  set1042S: (f: Form1042S | null) => void;

  // Step 4: computed returns (from /api/compute)
  computedFederal: Record<string, number | string | boolean> | null;
  computedMD: Record<string, number | string | boolean> | null;
  setComputedFederal: (r: Record<string, number | string | boolean>) => void;
  setComputedMD: (r: Record<string, number | string | boolean>) => void;

  // Live form overrides (user edits)
  formValues: FormValues;
  setFieldValue: (formId: string, lineId: string, value: number | string | boolean) => void;
  getFieldValue: (formId: string, lineId: string) => number | string | boolean | undefined;

  // User info
  county: string;
  setCounty: (c: string) => void;
  treatyExemptAmount: number;
  setTreatyExemptAmount: (n: number) => void;
}

export const useTaxStore = create<TaxStore>((set, get) => ({
  filerType: null,
  setFilerType: (t) => set({ filerType: t }),

  residencyAnswers: {},
  setResidencyAnswers: (a) => set((s) => ({ residencyAnswers: { ...s.residencyAnswers, ...a } })),

  w2: null,
  form1098t: null,
  form1042s: null,
  setW2: (w) => set({ w2: w }),
  set1098T: (f) => set({ form1098t: f }),
  set1042S: (f) => set({ form1042s: f }),

  computedFederal: null,
  computedMD: null,
  setComputedFederal: (r) => set({ computedFederal: r }),
  setComputedMD: (r) => set({ computedMD: r }),

  formValues: {},
  setFieldValue: (formId, lineId, value) =>
    set((s) => ({
      formValues: {
        ...s.formValues,
        [formId]: { ...s.formValues[formId], [lineId]: value },
      },
    })),
  getFieldValue: (formId, lineId) => get().formValues[formId]?.[lineId],

  county: "Prince George's",
  setCounty: (c) => set({ county: c }),

  treatyExemptAmount: 0,
  setTreatyExemptAmount: (n) => set({ treatyExemptAmount: n }),
}));
