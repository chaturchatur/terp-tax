"use client";

import { FormSection } from "./forms-layout/layout-1040";
import { FormLineComponent } from "./FormLine";
import { useTaxStore } from "@/lib/store";
import { Separator } from "@/components/ui/separator";

interface FormRendererProps {
  formId: string;
  layout: FormSection[];
  filerType: "resident" | "nonresident";
}

export function FormRenderer({ formId, layout, filerType }: FormRendererProps) {
  const { getFieldValue, setFieldValue, computedFederal, computedMD, w2, form1042s } = useTaxStore();

  function resolveValue(lineId: string): number | string | boolean | undefined {
    // Check for user override first
    const override = getFieldValue(formId, lineId);
    if (override !== undefined) return override;

    // Check computed returns
    const computed = formId.startsWith("md") ? computedMD : computedFederal;
    if (computed && lineId in computed) return computed[lineId] as number | string | boolean;

    // Check prefill sources
    const prefillSources: Record<string, number | string | undefined> = {
      "w2.wagesBox1": w2?.wagesBox1,
      "w2.federalWithheldBox2": w2?.federalWithheldBox2,
      "w2.stateWithheldBox17": w2?.stateWithheldBox17,
      "form1042s.grossIncome": form1042s?.grossIncome,
      "form1042s.federalTaxWithheld": form1042s?.federalTaxWithheld,
    };
    return undefined; // let FormLine show as empty
  }

  function getDisplayValue(lineId: string, source?: string): number | string | boolean | undefined {
    const override = getFieldValue(formId, lineId);
    if (override !== undefined) return override;

    // Computed or prefill from store
    const computed = formId.startsWith("md") ? computedMD : computedFederal;
    if (computed && lineId in computed) return computed[lineId] as number | string | boolean;

    // Prefill sources
    if (source) {
      const sourceMap: Record<string, number | string | undefined> = {
        "w2.wagesBox1": w2?.wagesBox1,
        "w2.federalWithheldBox2": w2?.federalWithheldBox2,
        "w2.stateWithheldBox17": w2?.stateWithheldBox17,
        "form1042s.grossIncome": form1042s?.grossIncome,
        "form1042s.federalTaxWithheld": form1042s?.federalTaxWithheld,
      };
      return sourceMap[source];
    }
    return undefined;
  }

  return (
    <div className="space-y-6">
      {layout.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-foreground mb-2 pb-1 border-b-2 border-primary/20">
            {section.title}
          </h3>
          <div className="space-y-0.5">
            {section.lines.map((line) => (
              <FormLineComponent
                key={line.id}
                line={line}
                formId={formId}
                value={getDisplayValue(line.id, line.source)}
                onChange={(val) => setFieldValue(formId, line.id, val)}
                filerType={filerType}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
