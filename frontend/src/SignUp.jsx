import { useState } from 'react'
import { supabase } from './supabaseClient'

function SignUp({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('parent')
  const [error, setError] = useState(null)

  async function handleSignUp(e) {
    e.preventDefault()
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role } // stores role as part of the user's metadata
      }
    })

    if (error) {
      setError(error.message)
    } else {
      onSuccess(data.user)
    }
  }

  return (
    <form onSubmit={handleSignUp}>
      <h2>Sign Up</h2>
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
      <div>
        <label>
          <input
            type="radio"
            value="parent"
            checked={role === 'parent'}
            onChange={(e) => setRole(e.target.value)}
          />
          I'm a parent looking for a tutor
        </label>
        <label>
          <input
            type="radio"
            value="tutor"
            checked={role === 'tutor'}
            onChange={(e) => setRole(e.target.value)}
          />
          I'm a tutor
        </label>
      </div>
      <button type="submit">Sign Up</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}

export default SignUp