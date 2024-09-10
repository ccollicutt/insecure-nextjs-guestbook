import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

// Custom Terminal Icon component
const TerminalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
)

export function HackerModeToggle() {
  const [mounted, setMounted] = useState(false)
  const [hackerMode, setHackerMode] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <Button
      onClick={() => {
        setHackerMode(!hackerMode)
        document.body.classList.toggle('hacker-mode')
      }}
      className="fixed top-4 left-4 p-2 rounded-full bg-white dark:bg-gray-800"
      variant="outline"
      size="icon"
    >
      <TerminalIcon />
      <span className="sr-only">Toggle hacker mode</span>
    </Button>
  )
}