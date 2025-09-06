
import './App.css'
import { useEffect } from 'react'
import { supabase } from './supabaseClient'
import AppRouter from './router/AppRouter'
function App() {
useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event)
        console.log("Session:", session)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])
  return (
    <>
      <AppRouter />
    </>
  )
}

export default App
