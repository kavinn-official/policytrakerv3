/**
 * Insurance Company Name Normalization Utility
 * Merges similar company names into standardized entries
 */

// Mapping of variations to canonical company names
const COMPANY_MAPPINGS: Record<string, string[]> = {
  'Cholamandalam': ['CHOLA', 'CHOLA MS', 'CHOLA MS GENERAL INSURANCE', 'CHOLAMANDALAM', 'CHOLAMANDALAM MS', 'CHOLAMANDALAM GENERAL INSURANCE', 'CHOLAMANDALAM MS GENERAL INSURANCE COMPANY LTD', 'CHOLAMANDALAM MS GENERAL INSURANCE COMPANY LTD.', 'CHOLAMANDALAM MS GENERAL INSURANCE CO LTD'],
  'BAJAJ ALLIANZ': ['BAJAJ', 'BAJAJ ALLIANZ GENERAL INSURANCE', 'BAJAJ ALLIANZ GIC'],
  'HDFC ERGO': ['HDFC', 'HDFC ERGO GENERAL INSURANCE'],
  'ICICI LOMBARD': ['ICICI', 'ICICI LOMBARD GENERAL INSURANCE', 'ICICI LOMBARD GIC'],
  'NEW INDIA ASSURANCE': ['NEW INDIA', 'NIA', 'NEW INDIA ASSURANCE CO'],
  'ORIENTAL INSURANCE': ['ORIENTAL', 'OIC', 'ORIENTAL INSURANCE CO'],
  'UNITED INDIA': ['UII', 'UNITED INDIA INSURANCE', 'UNITED INDIA INSURANCE CO'],
  'NATIONAL INSURANCE': ['NIC', 'NATIONAL', 'NATIONAL INSURANCE CO'],
  'TATA AIG': ['TATA', 'TATA AIG GENERAL INSURANCE'],
  'RELIANCE GENERAL': ['RELIANCE', 'RELIANCE GENERAL INSURANCE'],
  'ROYAL SUNDARAM': ['ROYAL', 'ROYAL SUNDARAM GENERAL INSURANCE'],
  'SBI GENERAL': ['SBI', 'SBI GENERAL INSURANCE'],
  'IFFCO TOKIO': ['IFFCO', 'IFFCO TOKIO GENERAL INSURANCE'],
  'FUTURE GENERALI': ['FUTURE', 'FUTURE GENERALI INDIA INSURANCE'],
  'DIGIT INSURANCE': ['DIGIT', 'GO DIGIT', 'DIGIT GENERAL INSURANCE'],
  'ACKO': ['ACKO GENERAL INSURANCE'],
  'KOTAK MAHINDRA': ['KOTAK', 'KOTAK GENERAL INSURANCE'],
  'LIBERTY GENERAL': ['LIBERTY', 'LIBERTY VIDEOCON'],
  'MAGMA HDI': ['MAGMA', 'HDI GLOBAL'],
  'SHRIRAM GENERAL': ['SHRIRAM', 'SHRIRAM GENERAL INSURANCE'],
};

/**
 * Normalizes a company name to its canonical form
 * @param companyName - Raw company name from policy
 * @returns Normalized company name
 */
export const normalizeCompanyName = (companyName: string | null | undefined): string => {
  if (!companyName) return 'UNKNOWN';
  
  // Normalize: uppercase, trim, collapse whitespace
  const normalized = companyName.trim().toUpperCase().replace(/\s+/g, ' ');
  
  // Check each canonical name and its variations
  for (const [canonical, variations] of Object.entries(COMPANY_MAPPINGS)) {
    // Check if the normalized name matches the canonical name exactly
    if (normalized === canonical) {
      return canonical;
    }
    
    // Check if it matches any variation
    for (const variation of variations) {
      if (normalized === variation || normalized.includes(variation) || variation.includes(normalized)) {
        return canonical;
      }
    }
    
    // Check if the normalized name contains the canonical name
    if (normalized.includes(canonical)) {
      return canonical;
    }
  }
  
  // Return the normalized version if no mapping found
  return normalized;
};

/**
 * Aggregates policies by normalized company name
 * @param policies - Array of policies
 * @returns Aggregated stats by normalized company name
 */
export const aggregateByNormalizedCompany = (
  policies: Array<{ company_name?: string | null; net_premium?: number | null }>
): Record<string, { count: number; premium: number }> => {
  const byCompany: Record<string, { count: number; premium: number }> = {};
  
  policies.forEach(policy => {
    const normalizedName = normalizeCompanyName(policy.company_name);
    const premium = Number(policy.net_premium) || 0;
    
    if (!byCompany[normalizedName]) {
      byCompany[normalizedName] = { count: 0, premium: 0 };
    }
    byCompany[normalizedName].count++;
    byCompany[normalizedName].premium += premium;
  });
  
  return byCompany;
};
