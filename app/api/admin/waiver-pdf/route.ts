import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { ADMIN_EMAIL } from "@/lib/admin";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path || !path.startsWith("2026/") || !path.endsWith(".pdf")) {
    return Response.json({ error: "Invalid path" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from("waivers")
    .download(path);

  if (error || !data) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  const filename = path.split("/").pop() ?? "waiver.pdf";
  return new Response(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
