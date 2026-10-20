import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import SignUp from './SignUp'
import Login from './Login'
import TutorProfile from './TutorProfile'
import ParentSearch from './ParentSearch'
import MyRequests from './MyRequests'
import TutorDashboard from './TutorDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [showSignUp, setShowSignUp] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(false)
  const [loadingSession, setLoadingSession] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? session.user : null)
      setLoadingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user && user.user_metadata.role === 'tutor') {
      checkProfile()
    }
  }, [user])

  async function checkProfile() {
    setCheckingProfile(true)

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    setProfileComplete(!!data)
    setCheckingProfile(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfileComplete(false)
  }

  if (loadingSession) {
    return <p>Loading...</p>
  }

  if (user && user.user_metadata.role === 'tutor' && checkingProfile) {
    return <p>Loading...</p>
  }

  if (user && user.user_metadata.role === 'tutor' && !profileComplete) {
    return <TutorProfile user={user} onSuccess={() => setProfileComplete(true)} />
  }

  if (user && user.user_metadata.role === 'tutor') {
    return (
      <div>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        <TutorDashboard user={user} />
      </div>
    )
  }

  if (user && user.user_metadata.role === 'parent') {
  return (
    <div>
      <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      <ParentSearch onRequestSent={() => setRefreshKey((k) => k + 1)} />
      <div className="page">
        <MyRequests key={refreshKey} user={user} />
      </div>
    </div>
  )
}

  return (
    <div>
      {showSignUp ? (
        <SignUp onSuccess={setUser} />
      ) : (
        <Login onSuccess={setUser} />
      )}
      <button onClick={() => setShowSignUp(!showSignUp)}>
        {showSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </button>
    </div>
  )
}

export default App