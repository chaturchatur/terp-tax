"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ExplainPanelProps {
  open: boolean;
  onClose: () => void;
  formId: string;
  lineNumber?: string;
  lineLabel: string;
  currentValue?: string | number;
  filerType: "resident" | "nonresident";
}

export function ExplainPanel({ open, onClose, formId, lineNumber, lineLabel, currentValue, filerType }: ExplainPanelProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<string | null>(null);

  const cacheKey = `${formId}-${lineNumber ?? lineLabel}`;

  async function fetchExplanation() {
    if (fetched === cacheKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          lineNumber: lineNumber ?? lineLabel,
          lineLabel,
          currentValue: currentValue !== undefined ? String(currentValue) : undefined,
          filerType,
        }),
      });
      const data = await res.json();
      setExplanation(data.explanation);
      setFetched(cacheKey);
    } catch {
      setExplanation("Unable to load explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch on open
  if (open && fetched !== cacheKey && !loading) {
    fetchExplanation();
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-2">
            {lineNumber && (
              <Badge variant="outline" className="font-mono text-xs">
                Line {lineNumber}
              </Badge>
            )}
            <SheetTitle className="text-base leading-tight">{lineLabel}</SheetTitle>
          </div>
          {currentValue !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              Current value:{" "}
              <span className="font-mono font-medium">
                {typeof currentValue === "number" ? `$${currentValue.toLocaleString()}` : String(currentValue)}
              </span>
            </p>
          )}
        </SheetHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide">
              Plain-English Explanation
            </p>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Asking Claude for an explanation…</span>
              </div>
            ) : explanation ? (
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{explanation}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
          </div>

          <div className="text-xs text-muted-foreground border-t pt-3">
            <p className="font-medium mb-1">Powered by Claude</p>
            <p>
              Explanations are generated from official IRS instructions and Maryland Comptroller guidance.
              Always verify with the official forms before filing.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
