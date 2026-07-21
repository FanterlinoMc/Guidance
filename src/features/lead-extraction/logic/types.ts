export interface ExtractedLeadFields {
  email?: string;
  phone?: string;
  // Name, city, and timeline require language understanding, not pattern matching -- same
  // reasoning as Step 25's intent detection: a regex guess would just fight the real
  // extraction mechanism Step 17's live model defines via structured tool use. Populated only
  // once Step 17 exists.
  name?: string;
  city?: string;
  timeline?: string;
}
