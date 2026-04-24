"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FormLine as FormLineType } from "./forms-layout/layout-1040";
import { ExplainPanel } from "./ExplainPanel";

interface FormLineProps {
  line: FormLineType;
  formId: string;
  value: number | string | boolean | undefined;
  onChange: (value: number | string | boolean) => void;
  filerType: "resident" | "nonresident";
}

export function FormLineComponent({ line, formId, value, onChange, filerType }: FormLineProps) {
  const [explainOpen, setExplainOpen] = useState(false);

  if (line.kind === "header") {
    return (
      <div className="col-span-full mt-2 mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{line.label}</p>
      </div>
    );
  }

  const displayValue = value !== undefined && value !== null ? value : "";
  const isComputed = line.kind === "computed";
  const isPrefill = line.kind === "prefill";
  const isReadonly = isComputed;

  const formattedValue =
    line.isCurrency && typeof displayValue === "number"
      ? displayValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : line.isPercent && typeof displayValue === "number"
      ? `${(displayValue * 100).toFixed(2)}%`
      : String(displayValue ?? "");

  function handleChange(raw: string) {
    if (line.isCurrency || typeof value === "number") {
      const num = parseFloat(raw.replace(/,/g, "")) || 0;
      onChange(num);
    } else {
      onChange(raw);
    }
  }

  return (
    <div className="grid grid-cols-[2rem_1fr_10rem_2rem] gap-2 items-center py-1 border-b border-border/40 last:border-0 hover:bg-accent/30 rounded px-1 group">
      {/* Line number */}
      <span className="text-xs font-mono text-muted-foreground text-right pr-1">
        {line.lineNumber ?? ""}
      </span>

      {/* Label + source badge */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm truncate">{line.label}</span>
        {isPrefill && line.source && (
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {line.source.split(".").pop()}
          </Badge>
        )}
        {isComputed && (
          <Badge variant="outline" className="text-[10px] shrink-0">
            computed
          </Badge>
        )}
      </div>

      {/* Value input */}
      <div className="relative">
        {line.isCurrency && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
        )}
        <Input
          value={formattedValue}
          readOnly={isReadonly}
          onChange={(e) => !isReadonly && handleChange(e.target.value)}
          className={`h-7 text-sm font-mono text-right pr-2 ${line.isCurrency ? "pl-5" : ""} ${
            isComputed ? "bg-muted/50 text-muted-foreground cursor-default border-dashed" : ""
          } ${isPrefill ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
          placeholder={line.isCurrency ? "0.00" : ""}
        />
      </div>

      {/* Explain button */}
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setExplainOpen(true)}
            >
              <Info className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Explain this field</TooltipContent>
        </Tooltip>
      </div>

      <ExplainPanel
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
        formId={formId}
        lineNumber={line.lineNumber}
        lineLabel={line.label}
        currentValue={typeof value === "number" ? value : undefined}
        filerType={filerType}
      />
    </div>
  );
}
