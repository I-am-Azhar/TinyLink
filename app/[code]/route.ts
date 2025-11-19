import { NextResponse } from "next/server";
import { incrementClickAndGetUrl } from "@/lib/links";

type Params = {
  params: {
    code: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  const url = await incrementClickAndGetUrl(params.code);
  if (!url) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.redirect(url, 302);
}

