import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

const roleRedirect: Record<string, string> = {
  vendor: "/vendor/dashboard",
  "venue-owner": "/venue/dashboard",
  planner: "/event-planner/dashboard",
  admin: "/admin/dashboard",
  user: "/",
};

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

async function ensureProfiles(user: { id: string; email?: string | null; user_metadata?: Record<string, any>; identities?: SupabaseIdentity[] }) {
  if (!user?.id || !user.email) return;

  const roleKey = (user.user_metadata?.role as string | undefined) ?? "user";
  const roleMap: Record<string, string> = {
    user: "USER",
    vendor: "VENDOR",
    "venue-owner": "VENUE",
    planner: "EVENT_PLANNER",
    admin: "ADMIN",
  };
  const prismaRole = (roleMap[roleKey] as any) ?? "USER";

  const profile = extractProfile(user);
  const name = profile.name ?? user.email.split("@")[0];
  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  const userId = existing?.id ?? user.id;

  await prisma.user.upsert({
    where: { email: user.email },
    update: { name, role: prismaRole },
    create: { id: userId, email: user.email, name, role: prismaRole },
  });

  if (roleKey === "vendor") {
    await prisma.vendorProfile.upsert({
      where: { userId },
      update: {
        companyName: user.user_metadata?.company || "My Vendor Company",
        phone: user.user_metadata?.phone || null,
        services: user.user_metadata?.category || user.user_metadata?.services || null,
        description: user.user_metadata?.description || "",
        website: user.user_metadata?.website || null,
      },
      create: {
        userId,
        companyName: user.user_metadata?.company || "My Vendor Company",
        phone: user.user_metadata?.phone || null,
        services: user.user_metadata?.category || user.user_metadata?.services || null,
        description: user.user_metadata?.description || "",
        website: user.user_metadata?.website || null,
      },
    });
  }

  if (roleKey === "planner") {
    await prisma.eventPlannerProfile.upsert({
      where: { userId },
      update: {
        companyName: user.user_metadata?.company || "My Planning Studio",
        phone: user.user_metadata?.phone || null,
        services: user.user_metadata?.plannerFocus || user.user_metadata?.services || null,
        description: user.user_metadata?.description || "",
        website: user.user_metadata?.website || null,
      },
      create: {
        userId,
        companyName: user.user_metadata?.company || "My Planning Studio",
        phone: user.user_metadata?.phone || null,
        services: user.user_metadata?.plannerFocus || user.user_metadata?.services || null,
        description: user.user_metadata?.description || "",
        website: user.user_metadata?.website || null,
      },
    });
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Handle OAuth code exchange to set the auth cookies
  const code = req.nextUrl.searchParams.get("code");
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await ensureProfiles(user as any);
    } catch (error) {
      console.error("post-login profile sync failed", error);
    }
  }

  const role = (user?.user_metadata?.role as string | undefined) ?? "user";
  const destination = roleRedirect[role] ?? "/";

  const url = new URL(destination, req.url);
  return NextResponse.redirect(url);
}
