"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { globalSearch } from "@/services/search.service";

export async function searchAction(query: string) {
  const session = await getServerSession(authOptions);
  return globalSearch(query, session?.user?.id);
}
