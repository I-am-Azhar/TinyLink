import { NextResponse } from "next/server";
import { deleteLink, getLink, serializeLink } from "@/lib/links";

type Params = {
  params: {
    code: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  const link = await getLink(params.code);
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializeLink(link));
}

export async function DELETE(_: Request, { params }: Params) {
  const deleted = await deleteLink(params.code);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}

