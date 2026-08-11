export default function BugLogo({
  size = 20,
  className,
  eyeColor = 'var(--color-kumo-base, #08080b)',
}: {
  size?: number
  className?: string
  eyeColor?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="7" y="6" width="10" height="13" rx="5" fill="currentColor" />
      <path d="M9 6a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 9v10M5 9H2.5M5 13H2M5 17H2.5M19 9h2.5M19 13h3M19 17h2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 8.5c0-1.1.9-2 2-2h1v12H7c-1.1 0-2-.9-2-2v-8ZM19 8.5c0-1.1-.9-2-2-2h-1v12h1c1.1 0 2-.9 2-2v-8Z" fill="currentColor" />
      <circle cx="10" cy="9" r="1" fill={eyeColor} />
      <circle cx="14" cy="9" r="1" fill={eyeColor} />
    </svg>
  )
}
