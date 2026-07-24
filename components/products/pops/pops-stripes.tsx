// Fixed candy-stripe field behind the whole page, with a white bloom over it so
// type stays readable. MUST be z-0 with page content in `relative z-10` — a
// negative z-index renders it behind the body background and the page goes blank.

export default function PopsStripes() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="pops-stripes absolute -inset-x-[20%] -inset-y-[10%] opacity-[0.42]" />
      <div className="pops-veil absolute inset-0" />
    </div>
  )
}
