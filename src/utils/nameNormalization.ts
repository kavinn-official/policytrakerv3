/**
 * Agent Name and Reference field normalization utility.
 * Standardizes names to Camel Case, trims whitespace, and corrects common spelling variations.
 */

// Predefined normalization mappings for common agent/reference names
const NAME_MAPPINGS: Record<string, string[]> = {
  'Siva S': ['SIVA', 'SIVA S'],
  'Senbagamoorthy': ['SENBAGAMORTHY', 'SENBAGAMOORTHY', 'SENBAGAMURTHY', 'SENBAGAMOORTHI'],
  // Add more mappings as needed
};

/**
 * Convert a string to Title Case (Camel Case for names)
 */
const toTitleCase = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Normalize a name field (Agent Name or Reference).
 * - Trims whitespace
 * - Collapses multiple spaces
 * - Checks predefined mappings for spelling corrections
 * - Converts to Title Case
 */
export const normalizeName = (name: string | null | undefined): string => {
  if (!name) return '';
  
  // Trim and collapse whitespace
  const cleaned = name.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  
  // Check against predefined mappings (case-insensitive)
  const upperCleaned = cleaned.toUpperCase();
  
  for (const [canonical, variations] of Object.entries(NAME_MAPPINGS)) {
    if (upperCleaned === canonical.toUpperCase()) {
      return canonical;
    }
    for (const variation of variations) {
      if (upperCleaned === variation) {
        return canonical;
      }
    }
  }
  
  // Default: convert to Title Case
  return toTitleCase(cleaned);
};
