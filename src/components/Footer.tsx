import { Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-4">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © 2024 IT Licei Qaraotkel. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/it_licei_qaraotkel/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Instagram className="h-5 w-5" />
            <span className="sr-only">Instagram</span>
          </a>
        </div>
      </div>
    </footer>
  )
} 