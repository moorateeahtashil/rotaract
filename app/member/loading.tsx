// Shown automatically by Next.js while a /member page's server data loads.
export default function MemberLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Heading */}
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-md bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-100" />
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-5">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="mt-4 h-7 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Content blocks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-5 space-y-3">
            <div className="h-5 w-40 rounded bg-gray-200" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-4 w-full rounded bg-gray-100" />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center pt-2">
        <div className="h-9 w-9 rounded-full border-4 border-rotary-blue/30 border-t-rotary-blue animate-spin" />
      </div>
    </div>
  );
}
