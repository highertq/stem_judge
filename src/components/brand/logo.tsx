/** Rubricly wordmark — square tick mark + "Rubric" (bold) + "ly" (58%). `compact` renders the mark only. */
export function Logo({ size = 18, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-[9px] font-display font-semibold tracking-[-0.3px] text-foreground"
      style={{ fontSize: size }}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-lg"
        style={{
          width: 28,
          height: 28,
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="3.5" />
        </svg>
      </span>
      {!compact && (
        <span>
          Rubric<span className="font-medium opacity-[0.58]">ly</span>
        </span>
      )}
    </span>
  )
}
