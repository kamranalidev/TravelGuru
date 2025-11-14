import { useEffect, useState, useContext, createContext } from "react";
import { supabase } from "../supabaseClient";

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at?: number | undefined;
  expires_in: number;
  token_type: string;
  user: any;
} | null;

type UserProfile = {
  id: number;
  created_at: string;
  full_name: string | null;
  user_id: string;
  email: string | null;
  user_role: number | null;
  phone_number: string | null;
  profile_picture: string | null;
  bio: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  passport_number: string | null;
  travel_preferences: string | null;
} | null;

const AuthContext = createContext<{
  session: Session;
  loading: boolean;
  profile: UserProfile;
  error: string | null;
  refreshProfile: () => Promise<void>;
}>({
  session: null,
  loading: true,
  profile: null,
  error: null,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [error, setError] = useState<string | null>(null);

  // Force stop loading after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Auth loading timeout, forcing stop");
      setLoading(false);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  // helper to check expiry
  const isSessionExpired = (session: Session) => {
    if (!session?.expires_at) return true;
    const now = Math.floor(Date.now() / 1000); // current epoch seconds
    return session.expires_at <= now;
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking session...");

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 10000)
        );

        const sessionPromise = supabase.auth.getSession();

        const {
          data: { session },
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

        if (!mounted) return;

        if (session && !isSessionExpired(session)) {
          setSession(session as Session);
          console.log("Session found:", session.user?.email);

          // Try to get user profile (optional, don't block on this)
          const fetchProfile = async () => {
            try {
              const { data: profileData } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", session.user.id)
                .single();

              if (mounted && profileData) {
                setProfile(profileData as UserProfile);
              }
            } catch (profileError) {
              // Silently handle profile fetch errors
              console.warn("Could not load user profile");
            }
          };

          fetchProfile();
        } else {
          console.log("No valid session found");
          localStorage.removeItem("supabase_session");
          setSession(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          console.log("Setting loading to false");
          setLoading(false);
        }
      }
    };

    checkSession();

    // listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state change:", _event);

      if (!mounted) return;

      if (session && !isSessionExpired(session)) {
        setSession(session as Session);
        setError(null);

        // Try to get user profile (optional)
        const fetchProfile = async () => {
          try {
            const { data: profileData } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();

            if (mounted && profileData) {
              setProfile(profileData as UserProfile);
            }
          } catch (profileError) {
            // Silently handle profile fetch errors
            console.warn("Could not load user profile in auth change");
          }
        };

        fetchProfile();
      } else {
        setSession(null);
        setProfile(null);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData as UserProfile);
      }
    } catch (error) {
      console.warn("Could not refresh user profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, profile, error, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
