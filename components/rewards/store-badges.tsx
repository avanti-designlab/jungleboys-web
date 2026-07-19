import { APP_LINKS } from '@/lib/rewards-content'

// App Store / Google Play badges (Figma exports, outlined style).

export default function StoreBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <a href={APP_LINKS.appStore} target="_blank" rel="noopener noreferrer">
        <img
          src="/rewards/badge-appstore.svg"
          alt="Download on the App Store"
          className="h-12 w-auto transition-opacity hover:opacity-80"
        />
      </a>
      <a href={APP_LINKS.googlePlay} target="_blank" rel="noopener noreferrer">
        <img
          src="/rewards/badge-googleplay.svg"
          alt="Get it on Google Play"
          className="h-12 w-auto transition-opacity hover:opacity-80"
        />
      </a>
    </div>
  )
}
