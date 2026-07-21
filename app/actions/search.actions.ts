"use server";

import { globalSearch } from "@/services/search.service";
import { auth } from "@/auth";

export async function searchAction(query: string) {
  const session = await auth();
  return await globalSearch(query, session?.user?.id);
}
