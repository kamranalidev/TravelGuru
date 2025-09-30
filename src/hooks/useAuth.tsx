import { useEffect, useState, useContext, createContext } from "react"
import { supabase } from "../supabaseClient" // adjust path
import { useNavigate } from "react-router-dom"

type Session = {
  access_token: string
  refresh_token: string
  expires_at?: number | undefined
  expires_in: number
  token_type:string
  user: any
} | null

const AuthContext = createContext<{
  session: Session
  loading: boolean
}>({
  session: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // helper to check expiry
  const isSessionExpired = (session: Session) => {
    if (!session?.expires_at) return true
    const now = Math.floor(Date.now() / 1000) // current epoch seconds
    return session.expires_at <= now
  }

  useEffect(() => {

    const checkSession = async () => {
      // Supabase automatically persists in localStorage
    // Or use your saved localStorage session
    let stored = localStorage.getItem("supabase_session")
    let localSession = stored ? JSON.parse(stored) : null

      // Try Supabase first
    const {
      data: { session }
    } = await supabase.auth.getSession()

  
    const activeSession = localSession|| session
      if (session && !isSessionExpired(activeSession)) {
        setSession(session as Session)
      } else {
        console.log("Session is either null or expired.");
        // expired or missing → sign out
        localStorage.removeItem("supabase_session")
        await supabase.auth.signOut()
        setSession(null)
      
      }
      setLoading(false)
    }

    checkSession()

    // listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth event:", _event)
      if (session && !isSessionExpired(session)) {
        setSession(session as Session)
      } else {
        setSession(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
