"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { DocumentDropzone } from "@/components/DocumentDropzone";
import { useTaxStore } from "@/lib/store";
import { W2Schema } from "@/lib/schemas/w2";
import { Form1098TSchema } from "@/lib/schemas/1098t";
import { Form1042SSchema } from "@/lib/schemas/1042s";

export default function DocumentsPage() {
  const router = useRouter();
  const { filerType, w2, form1098t, form1042s, setW2, set1098T, set1042S, setComputedFederal, setComputedMD, county, residencyAnswers } = useTaxStore();

  async function handleContinue() {
    // Trigger computation
    const res = await fetch("/api/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filerType: filerType ?? "resident",
        w2,
        form1098t,
        form1042s,
        county,
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
    router.push("/forms");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Upload Your Documents</h1>
          <p className="text-muted-foreground text-sm">
            Claude will extract all fields automatically. Supported: PDF or image (JPG, PNG).
          </p>
          {filerType && (
            <Badge variant="outline" className="mt-2">
              {filerType === "resident" ? "Resident — 1040 + MD 502" : "Non-Resident — 1040-NR + 8843 + MD 505"}
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">W-2</CardTitle>
                <Badge variant="secondary">Wage & Tax Statement</Badge>
              </div>
              <CardDescription className="text-xs">
                From your employer (UMD, campus job, etc.). Shows your wages and federal/state taxes withheld.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentDropzone
                formType="w2"
                label="Upload W-2"
                description="Required if you worked in the US"
                onExtracted={(data) => {
                  const parsed = W2Schema.safeParse(data);
                  if (parsed.success) setW2(parsed.data);
                  else setW2(data as Parameters<typeof setW2>[0]);
                }}
              />
              {w2 && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                  ✓ W-2 from {w2.employerName} — Box 1 wages: ${w2.wagesBox1?.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {filerType === "nonresident" && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Form 1042-S</CardTitle>
                  <Badge variant="destructive">International</Badge>
                </div>
                <CardDescription className="text-xs">
                  Reports US-source income paid to non-US persons (fellowships, stipends, treaty-exempt income).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentDropzone
                  formType="1042s"
                  label="Upload 1042-S"
                  description="If you received a fellowship or stipend"
                  onExtracted={(data) => {
                    const parsed = Form1042SSchema.safeParse(data);
                    if (parsed.success) set1042S(parsed.data);
                    else set1042S(data as Parameters<typeof set1042S>[0]);
                  }}
                />
                {form1042s && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ 1042-S — Gross income: ${form1042s.grossIncome?.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {filerType === "resident" && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Form 1098-T</CardTitle>
                  <Badge variant="secondary">Optional</Badge>
                </div>
                <CardDescription className="text-xs">
                  From UMD — shows tuition paid and scholarships. Required to claim the American Opportunity Tax Credit (up to $2,500).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentDropzone
                  formType="1098t"
                  label="Upload 1098-T"
                  description="Optional — needed for education tax credits"
                  onExtracted={(data) => {
                    const parsed = Form1098TSchema.safeParse(data);
                    if (parsed.success) set1098T(parsed.data);
                    else set1098T(data as Parameters<typeof set1098T>[0]);
                  }}
                />
                {form1098t && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ 1098-T from {form1098t.institutionName} — Tuition: ${form1098t.tuitionBilledBox1?.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-2 mt-8">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button
            className="flex-1"
            onClick={handleContinue}
            disabled={!w2 && !form1042s}
          >
            Continue to Forms <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          You can also skip uploads and fill all fields manually on the next screen.
        </p>
        <Button variant="link" className="w-full text-xs" onClick={() => router.push("/forms")}>
          Skip — enter manually →
        </Button>
      </div>
    </div>
  );
}
