import { supabase } from "../../utils/supabaseClient";

/**
 * Zvýší context_use_count o 1 pro každý záznam.
 */
export async function markMemoriesUsed(memoryIds: string[]) {
  for (const id of memoryIds) {
    const { data, error } = await supabase
      .from("mello_memory")
      .select("context_use_count")
      .eq("id", id)
      .single();

    if (!error && data) {
      await supabase
        .from("mello_memory")
        .update({ context_use_count: (data.context_use_count || 0) + 1 })
        .eq("id", id);
    }
  }
}
