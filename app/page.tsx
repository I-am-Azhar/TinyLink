import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getBaseUrl } from "@/lib/config";
import { getLinks } from "@/lib/links";

export const dynamic = "force-dynamic";

export default async function Page() {
  const links = await getLinks();
  const baseUrl = getBaseUrl();
  return <DashboardShell initialLinks={links} baseUrl={baseUrl} />;
}

