import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/card";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader } from "@/components/section-header";
import { TeamMemberRow } from "@/components/team-member-row";
import { demoDataNotice, demoTeam, demoTeamMembers } from "@/data/demo-data";

export default function TeamScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        eyebrow={demoDataNotice}
        title={demoTeam.name}
        subtitle={`${demoTeam.season} · neutrale Demo-Spieler fuer die erste UI-Basis.`}
      />
      <SectionHeader title="Teamuebersicht" caption="Lokale Mock-Spieler" />
      <Card>
        {demoTeamMembers.map((member) => (
          <TeamMemberRow key={member.id} member={member} />
        ))}
      </Card>
    </ScreenContainer>
  );
}
