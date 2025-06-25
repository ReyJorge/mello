import { supabase } from "../../utils/supabaseClient";

export type Memory = {
  id: string;
  content: string;
  type?: string;
  tags?: string[];
  created_at: string;
  context_use_count: number;
  journal?: boolean;
};

/**
 * Vrací nejdůležitější vzpomínky pro kontext chatu:
 * - prioritně deníkové vzpomínky
 * - nebo takové, které byly použity nejméněkrát
 * - limit nastavitelný (default 10)
 */
export async function getRelevantMemories(
  userId: string,
  limit = 10
): Promise<Memory[]> {
  const { data, error } = await supabase
    .from("mello_memory")
    .select("id, content, type, tags, created_at, context_use_count, journal")
    .eq("user_id", userId)
    .order("journal", { ascending: false }) // přednost mají deníkové vzpomínky
    .order("context_use_count", { ascending: true }) // pak ty, co ještě nebyly použity
    .order("created_at", { ascending: false }) // a nakonec nejnovější
    .limit(limit);

  if (error) {
    console.error("❌ Chyba při načítání vzpomínek:", error);
    return [];
  }

  return data || [];
}
