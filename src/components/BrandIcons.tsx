export function InstagramLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 448" className={className} aria-label="Instagram" role="img">
      <defs>
        <radialGradient id="ig-grad" cx="0.3" cy="1.07" r="1.2">
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.1" stopColor="#fdf497" />
          <stop offset="0.5" stopColor="#fd5949" />
          <stop offset="0.68" stopColor="#d6249f" />
          <stop offset="1" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="448" height="448" rx="100" fill="url(#ig-grad)" />
      <rect x="84" y="84" width="280" height="280" rx="76" fill="none" stroke="#fff" strokeWidth="34" />
      <circle cx="224" cy="224" r="66" fill="none" stroke="#fff" strokeWidth="34" />
      <circle cx="318" cy="130" r="22" fill="#fff" />
    </svg>
  )
}

export function WhatsAppLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-label="WhatsApp" role="img">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path
        fill="#fff"
        d="M23.4 8.6A10.4 10.4 0 0 0 7 21.1L5.6 26.4l5.4-1.4a10.4 10.4 0 0 0 5 1.3 10.4 10.4 0 0 0 7.4-17.7Zm-7.4 16a8.6 8.6 0 0 1-4.4-1.2l-.3-.2-3.2.8.9-3.1-.2-.3a8.6 8.6 0 1 1 7.2 4Zm4.7-6.4c-.3-.1-1.5-.8-1.8-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a7 7 0 0 1-2-1.3 7.7 7.7 0 0 1-1.5-1.8c-.1-.3 0-.4.1-.5l.4-.5.3-.4a.5.5 0 0 0 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c.6.3 1.1.4 1.5.5a3.6 3.6 0 0 0 1.6.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"
      />
    </svg>
  )
}
