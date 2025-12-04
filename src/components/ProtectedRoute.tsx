import { Navigate } from "react-router-dom";
import { Children, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({ children, onlyHeader = false }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  if (onlyHeader) {
    return session ? children : null;
  }

  return session ? children : <Navigate to="/onboarding" replace />;
}