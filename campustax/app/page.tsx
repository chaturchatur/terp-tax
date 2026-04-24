"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Globe, ArrowRight, Shield, FileText, DollarSign } from "lucide-react";
import { useTaxStore } from "@/lib/store";

export default function LandingPage() {
  const router = useRouter();
  const setFilerType = useTaxStore((s) => s.setFilerType);

  function handleResident() {
    setFilerType("resident");
    router.push("/documents");
  }

  function handleNonResident() {
    setFilerType("nonresident");
    router.push("/residency");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-background to-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">CampusTax</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            File your taxes for free,{" "}
            <span className="text-red-600">in plain English</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for UMD students. Upload your W-2 or 1042-S, and walk out with filled federal{" "}
            <em>and</em> Maryland state tax PDFs — with every line explained by Claude AI.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Badge variant="outline" className="text-xs">Federal + Maryland</Badge>
            <Badge variant="outline" className="text-xs">F-1 / J-1 visa support</Badge>
            <Badge variant="outline" className="text-xs">Free forever</Badge>
          </div>
        </div>

        {/* Value prop vs Sprintax */}
        <div className="grid grid-cols-3 gap-4 mb-10 text-center">
          <div className="rounded-lg border bg-card p-4">
            <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold">$0</p>
            <p className="text-xs text-muted-foreground">vs. Sprintax $91 total</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <FileText className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold">Every line</p>
            <p className="text-xs text-muted-foreground">explained in plain English</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Shield className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xl font-bold">Official PDFs</p>
            <p className="text-xs text-muted-foreground">filled from IRS templates</p>
          </div>
        </div>

        {/* Filer type selector */}
        <p className="text-center text-sm font-medium text-muted-foreground mb-4">
          First — tell us your immigration status:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:border-primary transition-colors hover:shadow-md"
            onClick={handleResident}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">US Citizen / Resident</CardTitle>
              </div>
              <CardDescription>
                US citizen, green card holder, or international student who has been in the US for
                more than 5 years on F-1/J-1.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground space-y-1 mb-4">
                <p>Forms you&apos;ll file:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Federal Form 1040</li>
                  <li>Maryland Form 502 + local/county tax</li>
                </ul>
              </div>
              <Button className="w-full">
                Start as Resident <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors hover:shadow-md border-red-200 dark:border-red-900"
            onClick={handleNonResident}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg">International Student</CardTitle>
                <Badge variant="destructive" className="text-xs ml-auto">F-1 / J-1</Badge>
              </div>
              <CardDescription>
                Currently on F-1 or J-1 visa and within your first 5 years in the US. You{" "}
                <strong>must</strong> file Form 8843 even with $0 income.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground space-y-1 mb-4">
                <p>Forms you&apos;ll file:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Federal Form 1040-NR</li>
                  <li>Form 8843 (required for all F/J students)</li>
                  <li>Maryland Form 505 (if you earned MD wages)</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950">
                Start as International Student <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Not sure? The residency wizard will determine your status automatically based on your visa and days in the US.
          <br />
          CampusTax is a filing guide — it does not e-file. You download and mail (or drop off) completed PDFs.
        </p>
      </div>
    </div>
  );
}
