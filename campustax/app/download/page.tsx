"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, CheckCircle, Mail, FileText, Loader2 } from "lucide-react";
import { useTaxStore } from "@/lib/store";

interface PdfFile {
  name: string;
  data: string; // base64
}

export default function DownloadPage() {
  const router = useRouter();
  const { filerType, computedFederal, computedMD, formValues, w2, form1042s, residencyAnswers } = useTaxStore();
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const isNR = filerType === "nonresident";

  const fedRefund = Number(computedFederal?.line35a_refund ?? computedFederal?.line35_refund ?? 0);
  const mdRefund = Number(computedMD?.line50_refund ?? computedMD?.line24_refund ?? 0);
  const fedOwed = Number(computedFederal?.line37_amountOwed ?? 0);
  const mdOwed = Number(computedMD?.line54_amountOwed ?? computedMD?.line28_amountOwed ?? 0);

  async function generatePDFs() {
    setLoading(true);
    setError(null);
    try {
      const personal = {
        firstName: (formValues["1040"]?.firstName ?? formValues["1040nr"]?.firstName ?? w2?.employeeName?.split(" ")[0] ?? ""),
        lastName: (formValues["1040"]?.lastName ?? formValues["1040nr"]?.lastName ?? w2?.employeeName?.split(" ").slice(1).join(" ") ?? ""),
        ssn: w2?.employeeSSN ?? "",
        countryOfCitizenship: residencyAnswers.countryOfCitizenship ?? "",
        visaType: residencyAnswers.visaType ?? "",
      };

      const res = await fetch("/api/fill-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filerType,
          federal: computedFederal,
          md: computedMD,
          personal,
          form8843: {
            ...personal,
            schoolName: "University of Maryland",
            schoolAddress: "College Park, MD 20742",
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const data = await res.json();
      setPdfFiles(data.files);
      setGenerated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF generation failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadFile(file: PdfFile) {
    const bytes = Uint8Array.from(atob(file.data), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAll() {
    pdfFiles.forEach((f) => downloadFile(f));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Download Your Returns</h1>
          <p className="text-sm text-muted-foreground">
            Your filled official tax forms are ready to print, sign, and mail.
          </p>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Return Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">Federal</p>
                {fedRefund > 0 ? (
                  <p className="text-lg font-bold text-green-600">+${fedRefund.toLocaleString()} refund</p>
                ) : (
                  <p className="text-lg font-bold text-red-600">-${fedOwed.toLocaleString()} owed</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {isNR ? "Form 1040-NR + 8843" : "Form 1040"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">Maryland</p>
                {mdRefund > 0 ? (
                  <p className="text-lg font-bold text-green-600">+${mdRefund.toLocaleString()} refund</p>
                ) : (
                  <p className="text-lg font-bold text-red-600">-${mdOwed.toLocaleString()} owed</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {isNR ? "Form 505" : "Form 502"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate / download */}
        {!generated ? (
          <div className="space-y-3">
            <Button className="w-full h-12 text-base" onClick={generatePDFs} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Filling PDFs…
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Filled PDFs
                </>
              )}
            </Button>
            {error && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
                {error.includes("Place official IRS") && (
                  <p className="mt-1 text-xs">
                    Download IRS fillable PDFs from irs.gov and place them in{" "}
                    <code className="font-mono">public/forms/</code>. See the Plan for exact filenames.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">PDFs generated successfully</span>
            </div>
            {pdfFiles.map((f) => (
              <div key={f.name} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{f.name}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadFile(f)}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
            ))}
            <Button className="w-full" onClick={downloadAll}>
              <Download className="h-4 w-4 mr-1" /> Download All Files
            </Button>
          </div>
        )}

        {/* Next steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="space-y-2">
              <p className="font-medium">After downloading:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                <li>Print all forms (do not fill in by hand after printing).</li>
                <li>Sign and date where indicated (typically the last page).</li>
                <li>
                  <strong className="text-foreground">Federal:</strong>{" "}
                  Mail to the IRS service center for your state. F-1/J-1 students mail to:
                  <br />
                  <code className="block mt-1 ml-4">
                    Department of the Treasury<br />
                    Internal Revenue Service<br />
                    Austin, TX 73301-0215
                  </code>
                </li>
                <li>
                  <strong className="text-foreground">Maryland:</strong>{" "}
                  Mail to:
                  <br />
                  <code className="block mt-1 ml-4">
                    Comptroller of Maryland<br />
                    Revenue Administration Division<br />
                    Annapolis, MD 21411-0001
                  </code>
                </li>
                <li>Keep copies of everything for at least 3 years.</li>
                <li>Deadline: April 15, 2025. No filing extension needed if you get a refund.</li>
              </ol>
            </div>

            <div className="rounded-md bg-muted p-3 text-xs">
              <p className="font-semibold mb-1">Disclaimer</p>
              <p>
                CampusTax is an educational tool built for UMD students. It is not a licensed tax
                preparation service. For complex situations (multiple states, self-employment, investment
                income), consult the UMD Financial Wellness Center or a licensed tax professional.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Badge variant="outline" className="text-xs">Built with Claude AI · Free for UMD students</Badge>
              <p className="text-xs text-muted-foreground">vs. Sprintax $91</p>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/forms")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Forms
        </Button>
      </div>
    </div>
  );
}
