"use server";

import { auth } from "@/auth";
import { globalSearch } from "@/services/search.service";

export async function searchAction(query: string) {
  const session = await auth();
  return globalSearch(query, session?.user?.id);
}
