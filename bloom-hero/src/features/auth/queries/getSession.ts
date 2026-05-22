import { cache } from "react";

import { getAuthUser } from "@/features/auth/queries/getAuthUser";
import { getCachedUserProfile } from "@/features/auth/queries/getCachedUserProfile";

export const getSession = cache(async () => {
  const user = await getAuthUser();

  if (!user) return { user: null, profile: null };

  const profile = await getCachedUserProfile(user.id);

  return { user, profile };
});
