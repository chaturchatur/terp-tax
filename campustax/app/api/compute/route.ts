import { NextRequest, NextResponse } from "next/server";
import { compute1040 } from "@/lib/tax/compute-1040";
import { compute1040NR } from "@/lib/tax/compute-1040nr";
import { computeMD502 } from "@/lib/tax/compute-md502";
import { computeMD505 } from "@/lib/tax/compute-md505";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { filerType, w2, form1098t, form1042s, county, filingStatus, treatyExemptAmount, countryOfCitizenship } = body;

  if (filerType === "resident") {
    const federal = compute1040({
      w2,
      form1098t,
      filingStatus: filingStatus ?? "single",
      taxableScholarships: body.taxableScholarships ?? 0,
    });

    const md = computeMD502({
      federalAGI: federal.line11_agi ?? 0,
      mdWithheld: w2?.stateWithheldBox17 ?? 0,
      county: county ?? "Prince George's",
      filingStatus: filingStatus ?? "single",
    });

    return NextResponse.json({ filerType: "resident", federal, md });
  }

  if (filerType === "nonresident") {
    const federal = compute1040NR({
      w2,
      form1042s,
      countryOfCitizenship: countryOfCitizenship ?? "",
      treatyExemptAmount: treatyExemptAmount ?? 0,
    });

    const mdSourceIncome = w2?.wagesBox1 ?? 0; // assume UMD campus job = MD-source
    const md = computeMD505({
      federalAGI: federal.line9_totalEffectivelyConnected ?? 0,
      mdSourceIncome,
      mdWithheld: w2?.stateWithheldBox17 ?? 0,
      filingStatus: filingStatus ?? "single",
      countryOfResidence: countryOfCitizenship ?? "",
    });

    return NextResponse.json({ filerType: "nonresident", federal, md });
  }

  return NextResponse.json({ error: "Invalid filerType" }, { status: 400 });
}
