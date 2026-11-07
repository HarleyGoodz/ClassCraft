import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../utils/supabase";

// Sends signed-in users who haven't chosen a username back to the setup page.
// Pages keep handling signed-out visitors themselves.
export default function RequireAccountSetup() {
  const [status, setStatus] = useState("checking"); // checking | incomplete | ok

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      const incomplete = session && !session.user.user_metadata?.username;
      setStatus(incomplete ? "incomplete" : "ok");
    });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") return null;
  if (status === "incomplete") return <Navigate to="/complete-signup" replace />;
  return <Outlet />;
}
