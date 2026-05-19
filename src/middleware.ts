import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/esqueci-senha", "/resetar-senha"];
const OPEN_ROUTES = ["/privacidade", "/termos", "/aceitar-convite"];

export async function middleware(request: NextRequest) {
  // Forward the pathname as a header so server components can read it.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isOpen = OPEN_ROUTES.some((route) => pathname.startsWith(route));
  if (isOpen) return response;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated users on /resetar-senha (they got there via recovery link)
  if (user && isPublic && !pathname.startsWith("/resetar-senha")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip:
     * - _next/static, _next/image
     * - favicon.ico, robots.txt
     * - api routes (handled separately)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|api).*)",
  ],
};
