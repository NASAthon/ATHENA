import MissionDataPanel from "@/components/MissionDataPanel";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <h1 className="text-3xl font-semibold">Crew</h1>
      <p className="mt-2 text-muted-foreground">Who is on the mission, and the mission data stored on this device.</p>
      <div className="mt-6">
        <MissionDataPanel />
      </div>
    </main>
  );
}
