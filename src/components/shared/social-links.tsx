'use client'

import { useState } from 'react'
import { useUtilityStore, isUrl } from '@/lib/utility-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/** Premium Telegram icon with gradient */
function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#37AEE2" />
          <stop offset="100%" stopColor="#1E96C8" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#tg-grad)" />
      <path
        d="M5.5 11.8l11-4.25c.5-.18.94.12.78.87l0 0-1.87 8.81c-.13.58-.47.72-.96.45l-2.65-1.95-1.28 1.23c-.14.14-.26.26-.53.26l.19-2.7 4.92-4.44c.21-.19-.05-.3-.33-.11l-6.08 3.82-2.62-.82c-.57-.18-.58-.57.12-.84l10.24-3.95c.47-.17.89.12.73.84l-1.75 8.22c-.12.56-.45.7-.91.43l-2.53-1.87-1.22 1.18c-.14.14-.25.25-.52.25l.18-2.68"
        fill="white"
      />
    </svg>
  )
}

/** Premium Facebook icon with gradient */
function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1877F2" />
          <stop offset="100%" stopColor="#0D65D9" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#fb-grad)" />
      <path
        d="M16.5 13l.5-3h-3V8c0-.83.4-1.5 1.68-1.5H17V3.86c-.5-.07-1.37-.22-2.32-.22C13.38 3.64 12 4.83 12 7.2V10H9v3h3v7h3.5v-7h2z"
        fill="white"
      />
    </svg>
  )
}

interface SocialLinkButtonProps {
  type: 'telegram' | 'facebook'
  value: string
  className?: string
  iconSize?: number
}

function SocialLinkButton({ type, value, className = '', iconSize = 20 }: SocialLinkButtonProps) {
  const [popupOpen, setPopupOpen] = useState(false)

  const handleClick = () => {
    if (isUrl(value)) {
      window.open(value, '_blank', 'noopener,noreferrer')
    } else {
      setPopupOpen(true)
    }
  }

  const label = type === 'telegram' ? 'Telegram' : 'Facebook'
  const Icon = type === 'telegram' ? TelegramIcon : FacebookIcon

  return (
    <>
      <button
        onClick={handleClick}
        className={`group relative flex items-center gap-2 rounded-xl border border-border/50 bg-card/50 px-3 py-2 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 ${className}`}
        title={isUrl(value) ? `Open ${label}` : value}
      >
        <div className="transition-transform duration-200 group-hover:scale-110">
          <Icon size={iconSize} />
        </div>
        <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground">
          {label}
        </span>
        {!isUrl(value) && (
          <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
            Soon
          </span>
        )}
      </button>

      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon size={24} />
              {label}
            </DialogTitle>
            <DialogDescription>
              {value}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <Icon size={36} />
            </div>
            <p className="text-sm font-medium text-center">{value}</p>
            <p className="text-xs text-muted-foreground text-center">
              {label} will be available soon. Stay tuned!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Premium social links component for use across the website.
 * - If admin sets a URL → clicking opens the link
 * - If admin sets text (e.g. "Coming Soon") → clicking shows a popup
 */
export function SocialLinks({ className = '', iconSize = 20 }: { className?: string; iconSize?: number }) {
  const { config } = useUtilityStore()

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SocialLinkButton type="telegram" value={config.telegramLink} iconSize={iconSize} />
      <SocialLinkButton type="facebook" value={config.facebookLink} iconSize={iconSize} />
    </div>
  )
}

export { TelegramIcon, FacebookIcon }
