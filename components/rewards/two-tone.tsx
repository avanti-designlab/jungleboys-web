// Section headline in the rewards page's two-tone style: white line(s) +
// yellow accent line, brand font, centered.

export function TwoTone({
  white,
  yellow,
  as: Tag = 'h2',
  align = 'center',
}: {
  white: string
  yellow: string
  as?: 'h1' | 'h2'
  align?: 'center' | 'left'
}) {
  return (
    <Tag
      className={`text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white md:text-4xl xl:text-5xl ${
        align === 'center' ? 'text-center' : ''
      }`}
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {white} <span className="block text-[var(--color-accent)]">{yellow}</span>
    </Tag>
  )
}
