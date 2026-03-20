import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SupabaseIdentity = { provider?: string; identity_data?: Record<string, any>; user_metadata?: Record<string, any> };

function extractProfile(user: { email?: string | null; user_metadata?: Record<string, any>; identities?: SupabaseIdentity[] }) {
  const identity = user.identities?.find((i) => i.provider === "google");
  const idMeta = identity?.identity_data || identity?.user_metadata || {};
  const meta = user.user_metadata || {};

  const name =
    (meta.full_name as string | undefined) ||
    (meta.name as string | undefined) ||
    (meta.given_name as string | undefined) ||
    (idMeta.full_name as string | undefined) ||
    (idMeta.name as string | undefined) ||
    (idMeta.given_name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : undefined);

  const picture =
    (meta.avatar_url as string | undefined) ||
    (meta.picture as string | undefined) ||
    (idMeta.avatar_url as string | undefined) ||
    (idMeta.picture as string | undefined) ||
    null;

  return { name: name ?? null, picture };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const profile = extractProfile(user as any);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
      vendorProfile: { select: { id: true } },
      eventPlannerProfile: { select: { id: true } },
    },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: profile.name,
      picture: profile.picture,
      role: (user.user_metadata?.role as string | undefined) ?? dbUser?.role ?? null,
      vendorProfileId: dbUser?.vendorProfile?.id ?? null,
      eventPlannerProfileId: dbUser?.eventPlannerProfile?.id ?? null,
    },
  });
}
