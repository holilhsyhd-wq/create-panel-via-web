import './globals.css'

export const metadata = {
  title: "Barmods — Pterodactyl Creator",
  description: "Create Pterodactyl users & servers"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
