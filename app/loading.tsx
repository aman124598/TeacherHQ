function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-full ${className}`} />
}

export default function Loading() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/60 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-[-8rem] h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.22)] backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <SkeletonLine className="h-4 w-40" />
              <SkeletonLine className="h-12 w-[min(42rem,100%)]" />
              <SkeletonLine className="h-4 w-[min(34rem,100%)]" />
              <SkeletonLine className="h-4 w-[min(28rem,100%)]" />
              <div className="flex flex-wrap gap-3 pt-2">
                <SkeletonBlock className="h-11 w-32 rounded-2xl" />
                <SkeletonBlock className="h-11 w-40 rounded-2xl" />
              </div>
            </div>

            <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-[28rem]">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                  <SkeletonLine className="h-3 w-16" />
                  <SkeletonLine className="mt-4 h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.24)] backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80 md:col-span-2">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <SkeletonLine className="h-4 w-28" />
                    <SkeletonLine className="h-10 w-72 max-w-full" />
                    <SkeletonLine className="h-4 w-[min(34rem,100%)]" />
                    <SkeletonLine className="h-4 w-[min(26rem,100%)]" />
                  </div>

                  <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70 lg:w-[22rem]">
                    <SkeletonLine className="h-3 w-20" />
                    <SkeletonLine className="h-3 w-[90%]" />
                    <SkeletonLine className="h-3 w-[75%]" />
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <SkeletonLine className="h-3 w-24" />
                      <SkeletonLine className="mt-3 h-5 w-full" />
                      <SkeletonLine className="mt-2 h-5 w-5/6" />
                    </div>
                  </div>
                </div>
              </div>

              {[1, 2].map((card) => (
                <div key={card} className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.24)] backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
                  <SkeletonLine className="h-4 w-24" />
                  <SkeletonLine className="mt-5 h-9 w-16" />
                  <SkeletonLine className="mt-4 h-3 w-full" />
                  <SkeletonLine className="mt-2 h-3 w-5/6" />
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.24)] backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <SkeletonLine className="h-4 w-28" />
                  <SkeletonLine className="h-6 w-56 max-w-full" />
                </div>
                <SkeletonBlock className="h-10 w-24 rounded-xl" />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <SkeletonLine className="h-3 w-24" />
                    <SkeletonLine className="mt-4 h-5 w-[85%]" />
                    <SkeletonLine className="mt-2 h-3 w-[70%]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.24)] backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
              <SkeletonLine className="h-4 w-32" />
              <div className="mt-5 space-y-4 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <SkeletonLine className="h-4 w-24" />
                <SkeletonLine className="h-3 w-full" />
                <SkeletonLine className="h-3 w-[85%]" />
                <SkeletonLine className="h-3 w-[70%]" />
              </div>

              <div className="mt-5 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <SkeletonLine className="h-3 w-20" />
                    <SkeletonLine className="mt-3 h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.24)] backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
              <SkeletonLine className="h-4 w-28" />
              <div className="mt-5 space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <SkeletonBlock className="h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <SkeletonLine className="h-3 w-full" />
                      <SkeletonLine className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
