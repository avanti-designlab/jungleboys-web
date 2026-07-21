import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Link-preview (Open Graph + Twitter) image: the white JB stacked logo centred
// on brand near-black. This file convention makes it the default share card for
// every route, so shared links no longer auto-grab a random hero image.

export const alt = 'Jungle Boys — Playing With Fire®'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const svg = await readFile(path.join(process.cwd(), 'public/brand/jb-stacked-white.svg'), 'utf-8')
  const logo = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  const logoW = 460
  const logoH = Math.round((logoW * 160.12) / 233.66)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0F',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={logoW} height={logoH} alt="" />
      </div>
    ),
    { ...size }
  )
}
