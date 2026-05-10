"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { CategoryOption } from "../types";

export async function fetchCategories(): Promise<CategoryOption[]>{
    const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, category_name")
    .order("category_name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CategoryOption[];
}