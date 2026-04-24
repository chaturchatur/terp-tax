"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Download } from "lucide-react";
import { FormRenderer } from "@/components/FormRenderer";
import { useTaxStore } from "@/lib/store";
import { layout1040 } from "@/components/forms-layout/layout-1040";
import { layout1040NR } from "@/components/forms-layout/layout-1040nr";
import { layout8843 } from "@/components/forms-layout/layout-8843";
import { layoutMD502 } from "@/components/forms-layout/layout-md502";
import { layoutMD505 } from "@/components/forms-layout/layout-md505";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MD_COUNTIES } from "@/lib/tax/md-local-rates";

export default function FormsPage() {
  const router = useRouter();
  const { filerType, computedFederal, computedMD, county, setCounty, setComputedFederal, setComputedMD, w2, form1042s, residencyAnswers } = useTaxStore();

  const isNR = filerType === "nonresident";

  const refundSummary = () => {
    const fedRefund = computedFederal?.line35a_refund ?? computedFederal?.line35_refund ?? 0;
    const mdRefund = computedMD?.line50_refund ?? computedMD?.line24_refund ?? 0;
    return { fedRefund: Number(fedRefund), mdRefund: Number(mdRefund) };
  };

  const { fedRefund, mdRefund } = refundSummary();
  const totalRefund = fedRefund + mdRefund;

  async function recompute(newCounty?: string) {
    const selectedCounty = newCounty ?? county;
    const res = await fetch("/api/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filerType: filerType ?? "resident",
        w2,
        form1042s,
        county: selectedCounty ?? "Prince George's",
        filingStatus: "single",
        countryOfCitizenship: residencyAnswers.countryOfCitizenship ?? "",
        treatyExemptAmount: 0,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setComputedFederal(data.federal ?? {});
      setComputedMD(data.md ?? {});
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Tax Return</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review every line. Click the <span className="font-mono bg-muted px-1 rounded">ⓘ</span> icon for a plain-English explanation.
            </p>
          </div>
          <div className="text-right">
            {totalRefund > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground">Estimated total refund</p>
                <p className="text-2xl font-bold text-green-600">${totalRefund.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Fed ${fedRefund.toLocaleString()} + MD ${mdRefund.toLocaleString()}
                </p>
              </div>
            ) : (
              <Badge variant="outline">Complete all fields to see refund</Badge>
            )}
          </div>
        </div>

        {/* County selector for residents */}
        {!isNR && (
          <div className="flex items-center gap-3 mb-6 p-3 rounded-lg border bg-card">
            <Label className="text-sm font-medium shrink-0">Maryland county:</Label>
            <Select
              value={county}
              onValueChange={(c) => {
                if (!c) return;
                setCounty(c);
                recompute(c);
              }}
            >
              <SelectTrigger className="w-56 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MD_COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used for local/county tax rate</p>
          </div>
        )}

        {/* Form tabs */}
        <Tabs defaultValue="federal">
          <TabsList className="mb-4">
            <TabsTrigger value="federal">
              Federal {isNR ? "1040-NR" : "1040"}
            </TabsTrigger>
            {isNR && <TabsTrigger value="8843">Form 8843</TabsTrigger>}
            <TabsTrigger value="maryland">
              Maryland {isNR ? "505" : "502"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="federal">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <p className="font-semibold text-sm">
                  {isNR ? "Form 1040-NR — U.S. Nonresident Alien Income Tax Return" : "Form 1040 — U.S. Individual Income Tax Return"}
                </p>
                <Badge variant="outline" className="text-xs">Tax Year 2024</Badge>
              </div>
              <FormRenderer
                formId={isNR ? "1040nr" : "1040"}
                layout={isNR ? layout1040NR : layout1040}
                filerType={filerType ?? "resident"}
              />
            </div>
          </TabsContent>

          {isNR && (
            <TabsContent value="8843">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <p className="font-semibold text-sm">
                    Form 8843 — Statement for Exempt Individuals
                  </p>
                  <Badge variant="destructive" className="text-xs">Required for all F/J students</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  This form must be filed by every F-1 and J-1 visa holder, even if you had $0 income.
                  It declares your exempt individual status to the IRS.
                </p>
                <FormRenderer
                  formId="8843"
                  layout={layout8843}
                  filerType="nonresident"
                />
              </div>
            </TabsContent>
          )}

          <TabsContent value="maryland">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <p className="font-semibold text-sm">
                  {isNR ? "Maryland Form 505 — Nonresident Income Tax Return" : "Maryland Form 502 — Resident Income Tax Return"}
                </p>
                <Badge variant="outline" className="text-xs">2024</Badge>
              </div>
              <FormRenderer
                formId={isNR ? "md505" : "md502"}
                layout={isNR ? layoutMD505 : layoutMD502}
                filerType={filerType ?? "resident"}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-8">
          <Button variant="outline" onClick={() => router.push("/documents")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button className="flex-1" onClick={() => router.push("/download")}>
            <Download className="h-4 w-4 mr-1" />
            Download Filled PDFs
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
