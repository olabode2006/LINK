import { useState } from 'react'
import { supabase } from './supabaseClient'
import { geocodePostalCode } from './geocode'

function TutorProfile({ user, onSuccess }) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [onlineOrOffline, setOnlineOrOffline] = useState('both')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const coords = await geocodePostalCode(postalCode)

    if (!coords) {
      setError('Could not find that postal code. Please check it and try again.')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      role: 'tutor',
      name,
      subject,
      experience_years: parseInt(experienceYears, 10),
      postal_code: postalCode,
      online_or_offline: onlineOrOffline,
      lat: coords.lat,
      lng: coords.lng
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="page">
      <form onSubmit={handleSubmit}>
        <h2>Complete Your Tutor Profile</h2>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject you teach (e.g. Math)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Years of experience"
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
        />
        <select
          value={onlineOrOffline}
          onChange={(e) => setOnlineOrOffline(e.target.value)}
        >
          <option value="online">Online only</option>
          <option value="offline">In-person only</option>
          <option value="both">Both</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Profile'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}

export default TutorProfile