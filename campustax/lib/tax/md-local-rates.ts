// Maryland county/local income tax rates for 2024 tax year
// Source: Maryland Comptroller — https://www.marylandtaxes.gov/individual/local.php

export const MD_LOCAL_RATES: Record<string, number> = {
  "Allegany": 0.0303,
  "Anne Arundel": 0.0281,
  "Baltimore City": 0.0320,
  "Baltimore County": 0.0320,
  "Calvert": 0.0300,
  "Caroline": 0.0330,
  "Carroll": 0.0303,
  "Cecil": 0.0280,
  "Charles": 0.0303,
  "Dorchester": 0.0320,
  "Frederick": 0.0296,
  "Garrett": 0.0265,
  "Harford": 0.0306,
  "Howard": 0.0320,
  "Kent": 0.0320,
  "Montgomery": 0.0320,
  "Prince George's": 0.0320, // College Park
  "Queen Anne's": 0.0285,
  "Saint Mary's": 0.0300,
  "Somerset": 0.0315,
  "Talbot": 0.0225,
  "Washington": 0.0280,
  "Wicomico": 0.0320,
  "Worcester": 0.0125,
};

export const MD_DEFAULT_COUNTY = "Prince George's"; // UMD default

export function getLocalRate(county: string): number {
  return MD_LOCAL_RATES[county] ?? MD_LOCAL_RATES[MD_DEFAULT_COUNTY];
}

export const MD_COUNTIES = Object.keys(MD_LOCAL_RATES).sort();
