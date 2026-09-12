import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import ThemeToggle from './ThemeToggle'

const principles = [
  { title: 'Less chasing.', description: 'Keep track of the details without another round of follow-ups.' },
  { title: 'Fewer surprises.', description: 'See what needs attention before it becomes a bigger problem.' },
  { title: 'More time to produce.', description: 'Spend less of your day on admin and more on moving the production forward.' },
]

function App() {
  return (
    <div className="flex min-h-svh flex-col [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-6 [&_a:focus-visible]:outline-accent">
      <header className="flex items-center justify-between gap-6 border-b border-divider px-10 py-6 max-[761px]:px-6 max-[761px]:py-5">
        <a className="inline-flex items-center gap-[11px] text-xl font-bold tracking-[-.04em]" href="/" aria-label="Levicity home">
          <span className="grid size-[30px] place-items-center rounded-md bg-accent text-[17px] font-extrabold text-ink" aria-hidden="true">L</span>
          levicity
        </a>
        <span className="font-mono text-[10px] tracking-[.04em] text-muted max-[761px]:hidden">Lightening your load.</span>
        <nav aria-label="Account" className="flex items-center gap-4 font-mono text-[11px] [&_button]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-accent">
          <ThemeToggle />
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="whitespace-nowrap py-2 hover:text-accent">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="whitespace-nowrap rounded-md bg-accent px-4 py-2 font-bold text-ink transition-colors hover:bg-accent-hover">Sign up</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-6 pt-[100px] pb-[90px] text-center min-[1600px]:py-[130px] max-[761px]:pt-20 max-[761px]:pb-16" aria-labelledby="hero-title">
          <div className="inline-flex items-center gap-[9px] rounded-full border border-accent/30 bg-accent/7 px-[14px] py-[9px] font-mono text-[10px] tracking-[.09em] text-accent uppercase max-[381px]:text-[8px]">
            <span className="size-[5px] shrink-0 rounded-full bg-accent" aria-hidden="true" />Something good is taking shape
          </div>
          <h1 id="hero-title" className="mt-[30px] mb-6 text-[clamp(20px,3.7vw,56px)] leading-[1.02] font-extrabold tracking-[-.045em] uppercase max-[381px]:text-[18px]">
            Life’s complicated.<br /><span className="text-accent">Let’s simplify.</span>
          </h1>
          <p className="max-w-[470px] text-[17px] leading-[1.8] text-muted max-[761px]:max-w-[390px] max-[761px]:text-[15px]">
            Built for producers. Thoughtful tools to simplify the day-to-day of production, so you can focus on bringing your next project to life.
          </p>
          <a className="mt-8 inline-flex items-center justify-between gap-[52px] rounded-md border border-accent bg-accent px-6 py-[15px] text-sm font-bold text-ink transition-colors duration-150 ease-in-out hover:bg-accent-hover" href="mailto:hello@levicity.com">
            Say hello <span aria-hidden="true">↗</span>
          </a>
          <p className="mt-[18px] font-mono text-[10px] text-muted">Coming soon. Made with intention.</p>
        </section>
        <section className="mx-auto mb-12 grid w-[min(1120px,calc(100%-80px))] grid-cols-3 border-y border-divider max-[761px]:mb-8 max-[761px]:w-[calc(100%-48px)] max-[761px]:grid-cols-1" aria-label="Our approach">
          {principles.map((principle, index) => (
            <div key={principle.title} className="flex items-baseline gap-[18px] border-divider px-6 py-[30px] not-first:border-l max-[761px]:px-1 max-[761px]:py-[22px] max-[761px]:not-first:border-t max-[761px]:not-first:border-l-0">
              <span className="font-mono text-[10px] whitespace-nowrap text-accent" aria-hidden="true">0{index + 1} /</span>
              <div>
                <h2 className="mb-[9px] text-sm font-bold">{principle.title}</h2>
                <p className="text-xs leading-[1.6] text-muted">{principle.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
      <footer className="flex justify-between gap-5 border-t border-divider px-10 py-6 font-mono text-[10px] text-muted max-[761px]:flex-wrap max-[761px]:px-6">
        <span>© {new Date().getFullYear()} Levicity</span>
        <span className="max-[761px]:order-3 max-[761px]:w-full">Good things take a little time.</span>
        <a className="text-foreground hover:text-accent" href="mailto:hello@levicity.com">hello@levicity.com <span className="ml-2 text-accent" aria-hidden="true">↗</span></a>
      </footer>
    </div>
  )
}
export default App
