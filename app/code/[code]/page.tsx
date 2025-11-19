export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { getBaseUrl } from "@/lib/config";
import { getLink } from "@/lib/links";

type Params = {
  params: {
    code: string;
  };
};

export async function generateMetadata({ params }: Params) {
  return {
    title: `Stats for ${params.code} | TinyLink`
  };
}

export default async function StatsPage({ params }: Params) {
  const link = await getLink(params.code);
  if (!link) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Link not found</h1>
        <p className="text-slate-600">
          We couldn&apos;t find a link with code <span className="font-mono">{params.code}</span>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          Go back to dashboard
        </Link>
      </div>
    );
  }

  const baseUrl = getBaseUrl();
  const shortUrl = `${baseUrl}/${link.code}`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Stats for {link.code}</h1>
        <p className="text-slate-600">Real-time insight into this short link.</p>
      </div>

      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Short URL</p>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="font-mono text-lg text-slate-900 truncate min-w-0">{shortUrl}</span>
            <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-2">
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
              >
                Open link
              </a>
              <CopyButton value={shortUrl} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Destination</p>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-words text-lg text-slate-900"
          >
            {link.url}
          </a>
        </div>
        <dl className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <dt className="text-sm text-slate-500">Total clicks</dt>
            <dd className="text-3xl font-semibold text-slate-900">{link.clicks}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <dt className="text-sm text-slate-500">Last clicked</dt>
            <dd className="text-lg text-slate-900">
              {link.lastClicked ? (
                <>
                  {new Date(link.lastClicked).toLocaleString()} (
                  {formatDistanceToNow(new Date(link.lastClicked), { addSuffix: true })})
                </>
              ) : (
                "Never"
              )}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <dt className="text-sm text-slate-500">Created at</dt>
            <dd className="text-lg text-slate-900">{new Date(link.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

