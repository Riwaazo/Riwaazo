import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";

const roleRouteMap: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/vendor", roles: ["vendor"] },
  { prefix: "/venue", roles: ["venue-owner"] },
  { prefix: "/event-planner", roles: ["planner"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/dashboard", roles: ["user", "vendor", "venue-owner", "planner", "admin"] },
];

const dashboardForRole = (role?: string | null) => {
  switch (role) {
    case "vendor":
      return "/vendor/dashboard";
    case "venue-owner":
      return "/venue/dashboard";
    case "planner":
      return "/event-planner/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/dashboard";
  }
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });
  const supabase = createMiddlewareClient({ req, res });

  const url = req.nextUrl;
  const path = url.pathname;

  // Always hydrate session cookies during OAuth code exchange and normal nav
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const matched = roleRouteMap.find((entry) => path.startsWith(entry.prefix));

  if (!matched) {
    return res;
  }

  // If route is protected but user not logged in, send to login with redirect back
  if (!session) {
    const redirect = new URL("/auth/login", req.url);
    redirect.searchParams.set("redirect", path);
    return NextResponse.redirect(redirect);
  }

  const role = session.user.user_metadata?.role as string | undefined;

  // If role not allowed for this prefix, bounce to their dashboard
  if (role && !matched.roles.includes(role)) {
    const redirect = new URL(dashboardForRole(role), req.url);
    return NextResponse.redirect(redirect);
  }

  // If no role yet (e.g., invited), allow for now but could force role selection later
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
