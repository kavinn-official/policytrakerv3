/**
 * Insurance Company Name Normalization Utility
 * Merges similar company names into standardized entries
 */

// Mapping of variations to canonical company names
const COMPANY_MAPPINGS: Record<string, string[]> = {
  'Cholamandalam': [
    'CHOLA', 'CHOLA MS', 'CHOLA MS GENERAL INSURANCE', 
    'CHOLAMANDALAM', 'CHOLAMANDALAM MS', 
    'CHOLAMANDALAM GENERAL INSURANCE', 
    'CHOLAMANDALAM MS GENERAL INSURANCE COMPANY LTD', 
    'CHOLAMANDALAM MS GENERAL INSURANCE COMPANY LTD.',
    'CHOLAMANDALAM MS GENERAL INSURANCE CO LTD'
  ],
  'National': [
    'NATIONAL', 'NATIONAL INS', 'NATIONAL INSURANCE', 
    'NATIONAL INSURANCE COMPANY', 'NATIONAL INSURANCE COMPANY LTD',
    'NATIONAL INSURANCE COMPANY LTD.', 'NIC', 'NATIONAL INSURANCE CO'
  ],
  'Iffco Tokio': [
    'IFFCO', 'IFFCO TOKIO', 'IFFCO TOKIO GENERAL INSURANCE',
    'IFFCO TOKIO GENERAL', 'IFFCO TOKIO GENERAL INSURANCE COMPANY',
    'IFFCO TOKIO GIC'
  ],
  'Bajaj Allianz': ['BAJAJ', 'BAJAJ ALLIANZ', 'BAJAJ ALLIANZ GENERAL INSURANCE', 'BAJAJ ALLIANZ GIC'],
  'HDFC Ergo': ['HDFC', 'HDFC ERGO', 'HDFC ERGO GENERAL INSURANCE'],
  'ICICI Lombard': ['ICICI', 'ICICI LOMBARD', 'ICICI LOMBARD GENERAL INSURANCE', 'ICICI LOMBARD GIC'],
  'New India Assurance': ['NEW INDIA', 'NIA', 'NEW INDIA ASSURANCE', 'NEW INDIA ASSURANCE CO'],
  'Oriental Insurance': ['ORIENTAL', 'OIC', 'ORIENTAL INSURANCE', 'ORIENTAL INSURANCE CO'],
  'United India': ['UII', 'UNITED INDIA', 'UNITED INDIA INSURANCE', 'UNITED INDIA INSURANCE CO'],
  'Tata AIG': ['TATA', 'TATA AIG', 'TATA AIG GENERAL INSURANCE'],
  'Reliance General': ['RELIANCE', 'RELIANCE GENERAL', 'RELIANCE GENERAL INSURANCE'],
  'Royal Sundaram': ['ROYAL', 'ROYAL SUNDARAM', 'ROYAL SUNDARAM GENERAL INSURANCE'],
  'SBI General': ['SBI', 'SBI GENERAL', 'SBI GENERAL INSURANCE'],
  'Future Generali': ['FUTURE', 'FUTURE GENERALI', 'FUTURE GENERALI INDIA INSURANCE'],
  'Digit Insurance': ['DIGIT', 'GO DIGIT', 'DIGIT GENERAL INSURANCE'],
  'Acko': ['ACKO', 'ACKO GENERAL INSURANCE'],
  'Kotak Mahindra': ['KOTAK', 'KOTAK GENERAL INSURANCE'],
  'Liberty General': ['LIBERTY', 'LIBERTY VIDEOCON', 'LIBERTY GENERAL'],
  'Magma HDI': ['MAGMA', 'HDI GLOBAL', 'MAGMA HDI'],
  'Shriram General': ['SHRIRAM', 'SHRIRAM GENERAL', 'SHRIRAM GENERAL INSURANCE'],
  // Aditya Birla variants - merged into single entity
  'Aditya Birla Health': [
    'ADITYA BIRLA', 'ADITYA BIRLA HEALTH', 'ADITYA BIRLA CAPITAL HEALTH',
    'ADITYA BIRLA HEALTH INSURANCE', 'ADITYA BIRLA CAPITAL HEALTH INSURANCE',
    'ADITYA BIRLA HEALTH INSURANCE CO', 'ADITYA BIRLA HEALTH INSURANCE COMPANY',
    'ADITYA BIRLA CAPITAL HEALTH INSURANCE CO', 'ADITYA BIRLA CAPITAL',
    'ABSLI', 'ABHI'
  ],
  // More common company names
  'Max Life': ['MAX', 'MAX LIFE', 'MAX LIFE INSURANCE'],
  'LIC': ['LIC', 'LIFE INSURANCE CORPORATION', 'LIC OF INDIA', 'LIFE INSURANCE CORPORATION OF INDIA'],
  'Star Health': ['STAR', 'STAR HEALTH', 'STAR HEALTH INSURANCE', 'STAR HEALTH AND ALLIED INSURANCE'],
  'Care Health': ['CARE', 'CARE HEALTH', 'CARE HEALTH INSURANCE', 'RELIGARE HEALTH'],
  'Niva Bupa': ['NIVA', 'NIVA BUPA', 'NIVA BUPA HEALTH', 'MAX BUPA'],
  'HDFC Life': ['HDFC LIFE', 'HDFC LIFE INSURANCE', 'HDFC STANDARD LIFE'],
  'ICICI Prudential': ['ICICI PRU', 'ICICI PRUDENTIAL', 'ICICI PRUDENTIAL LIFE'],
  'SBI Life': ['SBI LIFE', 'SBI LIFE INSURANCE'],
  'Bajaj Allianz Life': ['BAJAJ LIFE', 'BAJAJ ALLIANZ LIFE', 'BAJAJ ALLIANZ LIFE INSURANCE'],
};

/**
 * Normalizes a company name to its canonical form
 * @param companyName - Raw company name from policy
 * @returns Normalized company name
 */
export const normalizeCompanyName = (companyName: string | null | undefined): string => {
  if (!companyName) return 'Unknown';
  
  // Normalize: uppercase, trim, collapse whitespace
  const normalized = companyName.trim().toUpperCase().replace(/\s+/g, ' ');
  
  // Check each canonical name and its variations
  for (const [canonical, variations] of Object.entries(COMPANY_MAPPINGS)) {
    // Check if the normalized name matches the canonical name exactly (case insensitive)
    if (normalized === canonical.toUpperCase()) {
      return canonical;
    }
    
    // Check if it matches any variation
    for (const variation of variations) {
      if (normalized === variation || normalized.includes(variation) || variation.includes(normalized)) {
        return canonical;
      }
    }
    
    // Check if the normalized name contains the canonical name
    if (normalized.includes(canonical.toUpperCase())) {
      return canonical;
    }
  }
  
  // Return title case version if no mapping found
  return companyName.trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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
