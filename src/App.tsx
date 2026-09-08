import heroImg from './assets/hero.png'

function App() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col overflow-hidden bg-[#e9f0e9] bg-[linear-gradient(to_right,rgba(23,35,30,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,35,30,.035)_1px,transparent_1px)] bg-[size:72px_72px] px-6 py-5 text-[#17231e] sm:px-[5.5vw] sm:py-7">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-[#bdcabe]/60 sm:left-[5.5vw]" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-[#bdcabe]/60 sm:right-[5.5vw]" />
      <nav className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[.06em]">
        <a className="flex items-center gap-2.5 font-sans text-lg font-bold lowercase tracking-[-.04em]" href="/">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#17231e] text-[13px] text-[#d9f06a]">L</span>
          levicity
        </a>
        <div className="flex items-center gap-6">
          <span className="hidden text-[#9aa89f] sm:inline">2026</span>
          <span className="text-[#64736a]"><span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-[#a3c348]" />Coming soon</span>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-12 py-[12vh] sm:grid-cols-[minmax(300px,.9fr)_minmax(300px,1fr)] sm:gap-[6vw] sm:py-[7vh]">
        <div>
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[.1em] text-[#64736a]">Less to carry</p>
          <h1 className="text-[clamp(52px,7vw,102px)] font-medium leading-[.93] tracking-[-.075em]">
            Make room for<br /><em className="font-serif not-italic text-[#4d765d]">what&apos;s next.</em>
          </h1>
          <p className="my-7 max-w-[380px] text-base leading-[1.55] text-[#596961]">
            We&apos;re building thoughtful tools that lighten your load and make everyday life a little easier.
          </p>
          <p className="font-mono text-xs uppercase tracking-[.08em] text-[#4d765d]">Coming soon</p>
        </div>

        <div className="relative flex aspect-square w-[88vw] max-w-[560px] items-center justify-center self-center rounded-full bg-[#c9d9c9] shadow-[0_24px_80px_rgba(43,76,54,.12)] sm:w-full">
          <div className="absolute right-[14%] top-[15%] size-[19%] rounded-full bg-[#d9f06a]" />
          <div className="absolute h-[55%] w-[115%] rotate-[-30deg] rounded-[50%] border border-[#17231e33]" />
          <div className="absolute h-[85%] w-[75%] rotate-[55deg] rounded-[50%] border border-[#17231e33]" />
          <div className="absolute inset-[7%] rounded-full border border-[#17231e1f]" />
          <img className="relative z-10 w-[67%] brightness-95 saturate-50" src={heroImg} alt="" />
          <span className="absolute bottom-[13%] left-[14%] z-10 font-mono text-[10px]">01 / 01</span>
          <span className="absolute bottom-[13%] left-[14%] z-10 font-mono text-[10px]">01 / 01</span>
        </div>
      </section>

      <footer className="flex flex-wrap items-start justify-between gap-3 border-t border-[#bdcabe] pt-[18px] font-mono text-[11px] uppercase tracking-[.06em] text-[#718078]">
        <span>© {new Date().getFullYear()} Levicity</span>
        <span className="text-[#9aa89f] max-sm:order-3 max-sm:w-full">Good things take a little time.</span>
        <a className="text-[#4d765d]" href="mailto:hello@levicity.com">hello@levicity.com <span className="ml-1.5 text-base text-[#d9f06a]">↗</span></a>
      </footer>
    </main>
  )
}

export default App
