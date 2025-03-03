import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

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
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session for Server Components
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Protect /dashboard and its sub-routes
    if (pathname.startsWith("/dashboard")) {
      if (userError || !user) {
        // Redirect to sign-in if not authenticated
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      // Fetch user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      // Restrict /dashboard/new to landlords only
      if (pathname === "/dashboard/new" && profile.role !== "landlord") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Allow all other routes (e.g., /, /properties, /sign-in, /sign-up, /forgot-password)
    return response;
  } catch (e) {
    // Fallback if Supabase client fails
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

// Define which routes to protect
export const config = {
  matcher: ["/dashboard/:path*"],
};
