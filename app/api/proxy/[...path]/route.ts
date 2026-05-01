import { NextRequest, NextResponse } from "next/server";

const BACKEND = "https://unixdev38.pythonanywhere.com/api";

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathname = path.join("/");
  const search = req.nextUrl.search;
  const url = `${BACKEND}/${pathname}/${search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  const auth = req.headers.get("authorization");

  if (auth) headers.set("authorization", auth);
  headers.set("accept", "application/json");

  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    if (contentType?.includes("multipart/form-data")) {
      body = await req.formData();
    } else {
      if (contentType) headers.set("content-type", contentType);
      const text = await req.text();
      if (text) body = text;
    }
  }

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  const data = await upstream.arrayBuffer();

  return new NextResponse(data, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
