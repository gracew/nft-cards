import { supabase } from "./pages/api/supabase";
import { displayedTypes, spcTypes } from "./pages/give/[id]/category";

export async function resolveCategory(snapsCategory: string) {
  const category = (spcTypes.concat(displayedTypes)).find(c => c.id === snapsCategory);
  if (category) {
    return category;
  }
  const categoryRes = await supabase
    .from("categories")
    .select("*")
    .eq('id', snapsCategory);
  if (!categoryRes.data || categoryRes.data.length === 0) {
    console.log("could not resolve category");
    return;
  }
  return categoryRes.data[0];
}