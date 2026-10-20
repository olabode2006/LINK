import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function TutorDashboard({ user }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    const { data, error } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setRequests(data)
    setLoading(false)
  }

  async function respond(requestId, newStatus) {
    const updates = { status: newStatus }

    if (newStatus === 'accepted') {
      updates.tutor_email = user.email
    }

    await supabase
      .from('connection_requests')
      .update(updates)
      .eq('id', requestId)

    fetchRequests()
  }

  if (loading) return <div className="page"><p>Loading...</p></div>

  return (
    <div className="page">
      <h2>Your Connection Requests</h2>
      {requests.length === 0 && <p>No requests yet.</p>}
      <ul>
        {requests.map((r) => (
          <li key={r.id}>
            <span>Parent request ({r.status})</span>
            {r.status === 'pending' && (
              <span>
                <button onClick={() => respond(r.id, 'accepted')}>Accept</button>
                <button onClick={() => respond(r.id, 'declined')}>Decline</button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TutorDashboard