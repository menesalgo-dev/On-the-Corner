/**
 * types/database.types.ts
 *
 * ⚠️ FILE PLACEHOLDER — rigeneralo automaticamente con:
 *
 *   npx supabase gen types typescript --linked > types/database.types.ts
 *
 * Questo file impedisce errori di import finché non lanci il comando sopra.
 * Una volta generato il file reale, sostituiscilo per intero.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }>;
    Views: Record<string, { Row: Record<string, unknown> }>;
    Functions: Record<string, unknown>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, unknown>;
  };
}
