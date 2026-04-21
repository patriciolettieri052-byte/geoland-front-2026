import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Initial check
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()

    // Add listener
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])

  return isMobile
}
