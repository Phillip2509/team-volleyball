import { AppHeader } from "@/components/app-header";
import { EventCard } from "@/components/event-card";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader } from "@/components/section-header";
import { demoDataNotice, demoEvents } from "@/data/demo-data";

export default function EventsScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        eyebrow={demoDataNotice}
        title="Termine"
        subtitle="Trainings, Spiele und Teamtermine als lokale Demo-Ansicht."
      />
      <SectionHeader title="Naechste Termine" />
      {demoEvents.map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
    </ScreenContainer>
  );
}
