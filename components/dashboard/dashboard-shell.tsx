"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { LinkRecord } from "@/lib/links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type FormState = {
  url: string;
  code: string;
};

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

type Props = {
  initialLinks: LinkRecord[];
  baseUrl: string;
};

const parseLink = (payload: any): LinkRecord => ({
  code: payload.code,
  url: payload.url,
  clicks: payload.clicks,
  lastClicked: payload.lastClicked,
  createdAt: payload.createdAt
});

const ExternalLinkIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4 stroke-current"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
);

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4 stroke-current text-slate-400"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export function DashboardShell({ initialLinks, baseUrl }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [form, setForm] = useState<FormState>({ url: "", code: "" });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [search, setSearch] = useState("");
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }),
    []
  );

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const query = search.toLowerCase();
    return links.filter(
      (link) =>
        link.code.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query)
    );
  }, [links, search]);

  const handleFormChange = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const refreshLinks = useCallback(async () => {
    try {
      setLoadingTable(true);
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to load links");
      const data = await res.json();
      setLinks(data.map(parseLink));
    } catch (error: any) {
      setMessage({ type: "error", text: error.message ?? "Failed to refresh links." });
    } finally {
      setLoadingTable(false);
    }
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!form.url.trim()) {
      setMessage({ type: "error", text: "URL is required." });
      return;
    }

    if (form.code && !/^[A-Za-z0-9]{6,8}$/.test(form.code)) {
      setMessage({ type: "error", text: "Code must be 6-8 alphanumeric characters." });
      return;
    }

    try {
      setLoadingCreate(true);
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url.trim(),
          code: form.code.trim() || undefined
        })
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.error ?? "Failed to create link.");
      }

      const created = parseLink(await res.json());
      setLinks((prev) => {
        const existing = prev.filter((link) => link.code !== created.code);
        return [created, ...existing];
      });
      setForm({ url: "", code: "" });
      setMessage({ type: "success", text: "Link created successfully." });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message ?? "Failed to create link." });
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleDelete = async (code: string) => {
    const confirmed = window.confirm(`Delete short link ${code}?`);
    if (!confirmed) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete link");
      setLinks((prev) => prev.filter((link) => link.code !== code));
      setMessage({ type: "success", text: "Link deleted." });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message ?? "Failed to delete link." });
    }
  };

  const handleCopy = async (code: string) => {
    const shortUrl = `${baseUrl}/${code}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setMessage({ type: "success", text: "Short URL copied." });
    } catch {
      setMessage({ type: "error", text: "Copy failed. Try again." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Create short links and track performance at a glance.</p>
        </div>
        <div className="hidden w-full md:block md:w-64">
          <div className="relative">
            <Input
              placeholder="Search by code or URL"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="text-sm font-medium text-slate-700">Target URL</label>
            <Input
              name="url"
              placeholder="https://example.com/very/long/url"
              value={form.url}
              onChange={handleFormChange("url")}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Custom code (optional)</label>
            <Input
              name="code"
              placeholder="6-8 characters"
              value={form.code}
              onChange={handleFormChange("code")}
            />
          </div>
          {message && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                message.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" loading={loadingCreate}>
              Shorten URL
            </Button>
            <Button type="button" variant="secondary" onClick={refreshLinks} disabled={loadingTable}>
              Refresh
            </Button>
          </div>
        </form>
      </Card>

      <div className="block md:hidden">
        <div className="relative">
          <Input
            placeholder="Search by code or URL"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon />
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-semibold text-slate-900">Links</h2>
          <span className="text-sm text-slate-500">{links.length} total</span>
        </div>
        {loadingTable ? (
          <p className="text-sm text-slate-500">Loading links…</p>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center text-sm text-slate-500">
            {links.length === 0 ? (
              <p>You haven&apos;t created any links yet. Start by adding one above!</p>
            ) : (
              <p>No links match “{search}”.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Short URL</th>
                  <th className="px-3 py-2 font-medium">Target URL</th>
                  <th className="px-3 py-2 font-medium">Clicks</th>
                  <th className="px-3 py-2 font-medium">Last clicked</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLinks.map((link) => (
                  <tr key={link.code}>
                    <td className="px-3 py-3 font-mono text-sm text-slate-900">{link.code}</td>
                    <td className="px-3 py-3 max-w-[8rem] md:max-w-none">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(link.code)}
                          className="text-accent underline-offset-2 hover:underline truncate min-w-0 flex-1"
                          title={`${baseUrl}/${link.code}`}
                        >
                          {baseUrl}/{link.code}
                        </button>
                        <a
                          href={`${baseUrl}/${link.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full border border-slate-200 p-1 text-slate-400 hover:border-slate-300 hover:text-slate-600 flex-shrink-0"
                          aria-label={`Open ${link.code} in new tab`}
                        >
                          <ExternalLinkIcon />
                        </a>
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[12rem] text-slate-600 md:max-w-xs lg:max-w-xs">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate"
                        title={link.url}
                      >
                        {link.url}
                      </a>
                    </td>
                    <td className="px-3 py-3">{link.clicks}</td>
                    <td className="px-3 py-3 text-slate-500">
                      {link.lastClicked ? dateTimeFormatter.format(new Date(link.lastClicked)) : "Never"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                        <Link
                          href={`/code/${link.code}`}
                          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                        >
                          Stats
                        </Link>
                        <Button type="button" variant="ghost" onClick={() => handleCopy(link.code)}>
                          Copy
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleDelete(link.code)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

