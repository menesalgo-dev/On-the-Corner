'use client'

/**
 * components/home/SportTabs.tsx
 * Tab orizzontali per selezionare lo sport attivo sulla homepage.
 */
import { useRouter } from 'next/navigation'

interface Sport {
  key: string
  label: string
  emoji: string
}

interface SportTabsProps {
  sports: Sport[]
  activeSport: string
}

export function SportTabs({ sports, activeSport }: SportTabsProps) {
  const router = useRouter()

  function handleClick(key: string) {
    router.push(`/?sport=${key}`, { scroll: false })
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {sports.map(({ key, label, emoji }) => {
        const isActive = key === activeSport
        return (
          <button
            key={key}
            onClick={() => handleClick(key)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border transition-all"
            style={
              isActive
                ? { background: '#e8c800', color: '#080808', borderColor: '#e8c800' }
                : { background: 'transparent', color: '#666', borderColor: '#333' }
            }
          >
            {emoji} {label}
          </button>
        )
      })}
    </div>
  )
}
