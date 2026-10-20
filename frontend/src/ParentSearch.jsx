import { useState } from 'react'
import { supabase } from './supabaseClient'
import { geocodePostalCode } from './geocode'
import { getDistanceKm } from './distance'

function ParentSearch({ onRequestSent }) {
  const [subject, setSubject] = useState('')
  const [onlineOrOffline, setOnlineOrOffline] = useState('both')
  const [minExperience, setMinExperience] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
}

  async function handleSearch(e) {
    e.preventDefault()
    setError(null)

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'tutor')
      .ilike('subject', `%${subject}%`)

    if (onlineOrOffline !== 'both') {
      query = query.in('online_or_offline', [onlineOrOffline, 'both'])
    }

    if (minExperience) {
      query = query.gte('experience_years', parseInt(minExperience, 10))
    }

    const { data, error } = await query

    if (error) {
      setError(error.message)
      setSearched(true)
      return
    }

    if (postalCode) {
      const parentCoords = await geocodePostalCode(postalCode)

      if (parentCoords) {
        const withDistance = data.map((tutor) => {
          if (tutor.lat != null && tutor.lng != null) {
            const distance = getDistanceKm(
              parentCoords.lat,
              parentCoords.lng,
              tutor.lat,
              tutor.lng
            )
            return { ...tutor, distance }
          }
          return { ...tutor, distance: null }
        })

        withDistance.sort((a, b) => {
          if (a.distance == null) return 1
          if (b.distance == null) return -1
          return a.distance - b.distance
        })

        setResults(withDistance)
        setSearched(true)
        return
      }
    }

    setResults(data)
    setSearched(true)
  }

  async function handleConnect(tutor) {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('connection_requests').insert({
      parent_id: user.id,
      tutor_id: tutor.user_id,
      status: 'pending'
    })

    if (error) {
    if (error.code === '23505') {
     alert('You already sent a request to this tutor.')
    } else {
     alert('Could not send request: ' + error.message)
    }
  } else {
    alert('Request sent to ' + tutor.name)
    onRequestSent()
  }

  return (
    <div>
      <h2>Find a Tutor</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Subject (e.g. Math)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Your postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
        <select
          value={onlineOrOffline}
          onChange={(e) => setOnlineOrOffline(e.target.value)}
        >
          <option value="both">Online or in-person</option>
          <option value="online">Online only</option>
          <option value="offline">In-person only</option>
        </select>
        <input
          type="number"
          placeholder="Minimum years experience"
          value={minExperience}
          onChange={(e) => setMinExperience(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {searched && (
        <div>
          <h3>{results.length} tutor(s) found</h3>
          <ul>
            {results.map((tutor) => (
              <li key={tutor.id}>
                <strong>{tutor.name}</strong> — {tutor.subject}, {tutor.experience_years} yrs, {tutor.online_or_offline}
                {tutor.distance != null && ` — ${tutor.distance.toFixed(1)} km away`}
                <button onClick={() => handleConnect(tutor)}>Connect</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ParentSearch