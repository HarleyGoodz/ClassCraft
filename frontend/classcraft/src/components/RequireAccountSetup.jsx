import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { getUserHomePath } from "../utils/authRoles";
import { useLocation } from "react-router-dom";

// Sends signed-in users who haven't chosen a username back to the setup page.
// Pages keep handling signed-out visitors themselves.
export default function RequireAccountSetup() {
  const [status, setStatus] = useState("checking"); // checking | incomplete | ok
  const [homePath, setHomePath] = useState("/dashboard");
  const location = useLocation();

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      const incomplete = session && !session.user.user_metadata?.username;
      if (session) setHomePath(getUserHomePath(session.user));
      setStatus(incomplete ? "incomplete" : "ok");
    });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") return null;
  if (status === "incomplete") return <Navigate to="/complete-signup" replace />;
  // Admins stay inside the /admin pages; learners can't open them.
  const isAdmin = homePath === "/admin/dashboard";
  const onAdminPage = location.pathname.startsWith("/admin");
  if (onAdminPage && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isAdmin && !onAdminPage) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
}
