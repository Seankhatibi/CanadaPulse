export default function ProvinceLoading() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] px-3 py-20 sm:px-6" role="status" aria-label="Loading province briefing">
      <div className="mx-auto max-w-7xl animate-pulse space-y-7">
        <div className="h-4 w-36 rounded bg-stone-300" />
        <div className="h-14 max-w-2xl rounded bg-stone-300" />
        <div className="h-6 max-w-xl rounded bg-stone-200" />
        <div className="h-20 rounded-lg bg-white" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-64 rounded-lg bg-white" />
          <div className="h-64 rounded-lg bg-white" />
        </div>
      </div>
    </div>
  );
}
