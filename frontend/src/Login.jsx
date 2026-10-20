import { useState } from 'react'
import { supabase } from './supabaseClient'

function Login({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      onSuccess(data.user)
    }
  }

  async function handleForgotPassword() {
    setError(null)

    if (!email) {
      setError('Enter your email above first, then click "Forgot password"')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  return (
    <div className="page">
      <form onSubmit={handleLogin}>
        <h2>Log In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Log In</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <button type="button" onClick={handleForgotPassword} className="logout-btn">
        Forgot password?
      </button>
      {resetSent && <p>Check your email for a reset link.</p>}
    </div>
  )
}

export default Login