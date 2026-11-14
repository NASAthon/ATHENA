export default function PageShell({ title }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">Coming soon.</p>
    </main>
  );
}
