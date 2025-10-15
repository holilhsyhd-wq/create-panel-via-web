"use client"
import { useState } from "react"

export default function Home() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)

  const [serverName, setServerName] = useState("")
  const [selectedRam, setSelectedRam] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const RAM_OPTIONS = [
    { label: '1 GB', value: 1024 },
    { label: '2 GB', value: 2048 },
    { label: '3 GB', value: 3072 },
    { label: '4 GB', value: 4096 },
    { label: '5 GB', value: 5120 },
    { label: '6 GB', value: 6144 },
    { label: '7 GB', value: 7168 },
    { label: '8 GB', value: 8192 },
    { label: '9 GB', value: 9216 },
    { label: 'Unlimited', value: 0 }
  ]

  const handleLogin = (e) => {
    e.preventDefault()
    if (username === 'barmods' && password === 'barmods21') {
      // store public token to attach to requests (NEXT_PUBLIC_ADMIN_TOKEN must be set in env)
      if (process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
        localStorage.setItem('admin_token', process.env.NEXT_PUBLIC_ADMIN_TOKEN)
      }
      setLoggedIn(true)
      setUsername(''); setPassword('')
    } else {
      alert('Login failed: wrong credentials')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setLoggedIn(false)
    setResult(null)
  }

  const createServer = async (e) => {
    e.preventDefault()
    if (!serverName) return alert('Masukkan nama server')
    if (selectedRam === null) return alert('Pilih RAM terlebih dahulu')

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ADMIN-TOKEN': localStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({ serverName, ram: selectedRam })
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!loggedIn) {
    return (
      <main className="card">
        <header className="top">
          <img src="/logo.svg" alt="logo" />
          <div>
            <h1>Barmods — Pterodactyl Creator</h1>
            <div className="muted">Login to continue</div>
          </div>
        </header>

        <form onSubmit={handleLogin}>
          <label className="muted">Username</label>
          <input className="input" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username" />

          <label className="muted">Password</label>
          <input type="password" className="input" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password" />

          <div style={{display:'flex', gap:8}}>
            <button className="btn" type="submit">Login</button>
          </div>

          <p className="muted" style={{marginTop:8}}>Use: <b>barmods</b> / <b>barmods21</b></p>
        </form>
      </main>
    )
  }

  return (
    <main className="card">
      <header className="top">
        <img src="/logo.svg" alt="logo" />
        <div>
          <h1>Barmods — Pterodactyl Creator</h1>
          <div className="muted">Create users & servers quickly</div>
        </div>
      </header>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div className="muted">Logged in as <b>barmods</b></div>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>

      <form onSubmit={createServer}>
        <label className="muted">Nama Server</label>
        <input className="input" required value={serverName} onChange={(e)=>setServerName(e.target.value)} placeholder="contoh: bot-telegram" />

        <label className="muted">Pilih RAM</label>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:8, marginBottom:12}}>
          {RAM_OPTIONS.map(opt => (
            <button
              key={opt.label}
              type="button"
              onClick={()=>setSelectedRam(opt.value)}
              className="btn"
              style={{ background: selectedRam === opt.value ? 'linear-gradient(90deg,#06b6d4,#3b82f6)' : undefined, padding:'8px 12px' }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{display:'flex', gap:8}}>
          <button className="btn" disabled={loading} type="submit">{loading ? 'Membuat...' : 'Buat Server'}</button>
        </div>
      </form>

      {result && (
        <div className="result">
          {result.error ? (
            <div style={{color:'#ff7b7b'}}>❌ {result.error}</div>
          ) : (
            <div>
              <div style={{color:'#7efc9b', fontWeight:600}}>✅ Server Berhasil Dibuat!</div>
              <div style={{marginTop:8}}><b>Panel:</b> {process.env.NEXT_PUBLIC_PTERO_DOMAIN || 'Panel URL'}</div>
              <div><b>Email:</b> {result.email}</div>
              <div><b>Username:</b> {result.username}</div>
              <div><b>Password:</b> {result.password}</div>
              <div><b>Server:</b> {result.server?.name || '—'}</div>
              <div><b>RAM:</b> {result.server?.limits?.memory === 0 ? 'Unlimited' : result.server?.limits?.memory + ' MB'}</div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
