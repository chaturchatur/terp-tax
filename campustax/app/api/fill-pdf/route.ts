import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

// Field name mappings for each form
// These are placeholder names — in production, inspect the actual IRS fillable PDFs
// and replace with the real AcroForm field names from those documents.

const FIELD_MAP_1040: Record<string, string> = {
  firstName: "f1_02[0]",
  lastName: "f1_03[0]",
  ssn: "f1_04[0]",
  line1a_wagesSalaries: "f1_28[0]",
  line11_agi: "f1_38[0]",
  line12_standardOrItemized: "f1_39[0]",
  line15_taxableIncome: "f1_41[0]",
  line16_tax: "f1_42[0]",
  line22_totalTax: "f1_48[0]",
  line25a_w2FedWithheld: "f1_49[0]",
  line33_totalPayments: "f1_56[0]",
  line35a_refund: "f1_58[0]",
  line37_amountOwed: "f1_60[0]",
};

const FIELD_MAP_1040NR: Record<string, string> = {
  firstName: "f1_01[0]",
  lastName: "f1_02[0]",
  line1a_wagesSalaries: "f1_20[0]",
  line15_taxableIncome: "f1_30[0]",
  line16_tax: "f1_31[0]",
  line23_totalTax: "f1_38[0]",
  line33_totalPayments: "f1_46[0]",
  line35_refund: "f1_48[0]",
  line37_amountOwed: "f1_50[0]",
};

const FIELD_MAP_8843: Record<string, string> = {
  firstName: "f1_01[0]",
  lastName: "f1_02[0]",
  ssn: "f1_03[0]",
  countryOfCitizenship: "f1_06[0]",
  typeOfUSVisa: "f1_07[0]",
  schoolName: "f1_12[0]",
  schoolAddress: "f1_13[0]",
};

async function fillForm(
  pdfPath: string,
  fieldMap: Record<string, string>,
  data: Record<string, unknown>
): Promise<Uint8Array | null> {
  const absPath = path.join(process.cwd(), pdfPath);
  if (!fs.existsSync(absPath)) return null;

  const pdfBytes = fs.readFileSync(absPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  for (const [dataKey, fieldName] of Object.entries(fieldMap)) {
    const value = data[dataKey];
    if (value === undefined || value === null) continue;
    try {
      const field = form.getTextField(fieldName);
      field.setText(String(typeof value === "number" ? value.toFixed(2) : value));
    } catch {
      // Field not found — skip (field names vary across PDF versions)
    }
  }

  return pdfDoc.save();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { filerType, federal, md, personal, form8843 } = body;

  const files: { name: string; bytes: Uint8Array }[] = [];

  if (filerType === "resident") {
    const federalBytes = await fillForm("public/forms/f1040.pdf", FIELD_MAP_1040, {
      ...personal,
      ...federal,
    });
    if (federalBytes) files.push({ name: "federal-1040.pdf", bytes: federalBytes });

    const mdBytes = await fillForm("public/forms/md502.pdf", {}, md ?? {});
    if (mdBytes) files.push({ name: "maryland-502.pdf", bytes: mdBytes });
  } else {
    const federalBytes = await fillForm("public/forms/f1040nr.pdf", FIELD_MAP_1040NR, {
      ...personal,
      ...federal,
    });
    if (federalBytes) files.push({ name: "federal-1040nr.pdf", bytes: federalBytes });

    const form8843Bytes = await fillForm("public/forms/f8843.pdf", FIELD_MAP_8843, {
      ...personal,
      ...form8843,
    });
    if (form8843Bytes) files.push({ name: "form-8843.pdf", bytes: form8843Bytes });

    const mdBytes = await fillForm("public/forms/md505.pdf", {}, md ?? {});
    if (mdBytes) files.push({ name: "maryland-505.pdf", bytes: mdBytes });
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "No PDF templates found. Place official IRS fillable PDFs in public/forms/." }, { status: 404 });
  }

  // Return as JSON with base64-encoded PDFs (client will assemble zip)
  const result = files.map((f) => ({
    name: f.name,
    data: Buffer.from(f.bytes).toString("base64"),
  }));

  return NextResponse.json({ files: result });
}
