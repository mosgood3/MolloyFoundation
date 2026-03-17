// src/app/teams/page.tsx
import TeamsClient from "@/components/teamsclient";
import { getTeams } from "@/actions/teams";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const { teams: initialTeams, total: initialTotal } = await getTeams(1);

  return (
    <section id="teams" className="pb-20 bg-white">
      <TeamsClient initialTeams={initialTeams} initialTotal={initialTotal} />
    </section>
  );
}
