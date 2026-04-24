"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Info } from "lucide-react";
import { useTaxStore } from "@/lib/store";
import { computeSPT } from "@/lib/tax/spt";

export default function ResidencyPage() {
  const router = useRouter();
  const { setResidencyAnswers, setFilerType } = useTaxStore();

  const [step, setStep] = useState(0);
  const [visaType, setVisaType] = useState<"F-1" | "J-1" | "H-1B" | "other">("F-1");
  const [countryOfCitizenship, setCountryOfCitizenship] = useState("");
  const [exemptYearsUsed, setExemptYearsUsed] = useState(0);
  const [daysCurrentYear, setDaysCurrentYear] = useState(0);
  const [daysPriorYear1, setDaysPriorYear1] = useState(0);
  const [daysPriorYear2, setDaysPriorYear2] = useState(0);
  const [sptResult, setSptResult] = useState<ReturnType<typeof computeSPT> | null>(null);

  const steps = [
    "Visa type",
    "Days in US",
    "Result",
  ];

  function handleCompute() {
    const result = computeSPT({
      visaType,
      exemptYearsUsed,
      daysCurrentYear,
      daysPriorYear1,
      daysPriorYear2,
    });
    setSptResult(result);
    setResidencyAnswers({
      visaType,
      exemptYearsUsed,
      daysCurrentYear,
      daysPriorYear1,
      daysPriorYear2,
      countryOfCitizenship,
    });
    setFilerType(result.isResident ? "resident" : "nonresident");
    setStep(2);
  }

  function handleContinue() {
    router.push("/documents");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <span className="text-muted-foreground mx-1">→</span>}
            </div>
          ))}
        </div>

        {/* Step 0: Visa type */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Immigration Status</CardTitle>
              <CardDescription>
                This helps us determine whether you file as a resident or non-resident alien.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Visa type</Label>
                <Select value={visaType} onValueChange={(v) => setVisaType(v as typeof visaType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F-1">F-1 (Student)</SelectItem>
                    <SelectItem value="J-1">J-1 (Exchange Visitor)</SelectItem>
                    <SelectItem value="H-1B">H-1B (Specialty Worker)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Country of citizenship</Label>
                <Input
                  placeholder="e.g. China, India, South Korea"
                  value={countryOfCitizenship}
                  onChange={(e) => setCountryOfCitizenship(e.target.value)}
                />
              </div>

              {(visaType === "F-1" || visaType === "J-1") && (
                <div className="space-y-2">
                  <Label>
                    How many prior calendar years have you already used as an exempt F/J student?
                  </Label>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Info className="h-3 w-3" />
                    <span>Count each year you were in the US on F/J status, starting from your first year.</span>
                  </div>
                  <Select
                    value={String(exemptYearsUsed)}
                    onValueChange={(v) => v && setExemptYearsUsed(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} year{n !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                className="w-full"
                disabled={!countryOfCitizenship}
                onClick={() => {
                  // F/J within 5 years = non-resident, skip day counting
                  if ((visaType === "F-1" || visaType === "J-1") && exemptYearsUsed < 5) {
                    handleCompute();
                  } else {
                    setStep(1);
                  }
                }}
              >
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Days in US */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Days Present in the US</CardTitle>
              <CardDescription>
                The IRS Substantial Presence Test uses a 3-year weighted formula to determine residency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Days in the US during 2024</Label>
                <Input
                  type="number"
                  min={0}
                  max={366}
                  value={daysCurrentYear}
                  onChange={(e) => setDaysCurrentYear(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Days in the US during 2023</Label>
                <Input
                  type="number"
                  min={0}
                  max={365}
                  value={daysPriorYear1}
                  onChange={(e) => setDaysPriorYear1(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Days in the US during 2022</Label>
                <Input
                  type="number"
                  min={0}
                  max={365}
                  value={daysPriorYear2}
                  onChange={(e) => setDaysPriorYear2(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="rounded-md bg-muted p-3 text-xs">
                <p className="font-medium mb-1">SPT Formula Preview</p>
                <p>
                  {daysCurrentYear} + {Math.floor(daysPriorYear1 / 3)} (1/3 of {daysPriorYear1}) +{" "}
                  {Math.floor(daysPriorYear2 / 6)} (1/6 of {daysPriorYear2}) ={" "}
                  <strong>
                    {daysCurrentYear + Math.floor(daysPriorYear1 / 3) + Math.floor(daysPriorYear2 / 6)} days
                  </strong>{" "}
                  {daysCurrentYear + Math.floor(daysPriorYear1 / 3) + Math.floor(daysPriorYear2 / 6) >= 183
                    ? "≥ 183 → Resident"
                    : "< 183 → Non-resident"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button className="flex-1" onClick={handleCompute}>
                  Calculate <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Result */}
        {step === 2 && sptResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle>Your Filing Status</CardTitle>
                <Badge variant={sptResult.isResident ? "default" : "destructive"}>
                  {sptResult.isResident ? "Resident Alien" : "Non-Resident Alien"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4 text-sm leading-relaxed">
                {sptResult.explanation}
              </div>

              <div className="rounded-md border p-4 text-sm space-y-2">
                <p className="font-medium">You will file:</p>
                {sptResult.isResident ? (
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Federal Form 1040</li>
                    <li>Maryland Form 502 + county/local tax</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Federal Form 1040-NR</li>
                    <li>Form 8843 (required even with $0 income)</li>
                    <li>Maryland Form 505 (if you earned wages in MD)</li>
                  </ul>
                )}
              </div>

              <Button className="w-full" onClick={handleContinue}>
                Continue to Upload Documents <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
