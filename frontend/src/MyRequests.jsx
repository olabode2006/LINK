import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function MyRequests({ user }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    const { data: reqs, error } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !reqs) {
      setLoading(false)
      return
    }

    // Look up the tutor names for these requests
    const tutorIds = [...new Set(reqs.map((r) => r.tutor_id))]
    const tutorsById = {}

    if (tutorIds.length > 0) {
      const { data: tutors } = await supabase
        .from('profiles')
        .select('user_id, name, subject')
        .in('user_id', tutorIds)

      ;(tutors || []).forEach((t) => {
        tutorsById[t.user_id] = t
      })
    }

    setRequests(reqs.map((r) => ({ ...r, tutor: tutorsById[r.tutor_id] })))
    setLoading(false)
  }

  if (loading) return <p>Loading your requests...</p>

  return (
    <div>
      <h3>My Requests</h3>
      {requests.length === 0 && <p>You haven't sent any requests yet.</p>}
      <ul>
        {requests.map((r) => (
          <li key={r.id}>
            <span>
              <strong>{r.tutor ? r.tutor.name : 'Tutor'}</strong>
              {r.tutor && ` (${r.tutor.subject})`} : {r.status}
              {r.status === 'accepted' && r.tutor_email && (
                <> | Contact: {r.tutor_email}</>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MyRequests