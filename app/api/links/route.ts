import { NextResponse } from "next/server";
import {
  createLink,
  getLinks,
  serializeLink,
  ValidationError,
  DuplicateCodeError,
  DuplicateUrlError
} from "@/lib/links";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const links = await getLinks(search);
  return NextResponse.json(links.map(serializeLink));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const link = await createLink({ url: body?.url, code: body?.code });
    return NextResponse.json(serializeLink(link), { status: 201 });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof DuplicateCodeError || error instanceof DuplicateUrlError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

