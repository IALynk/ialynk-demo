"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
  allowedRoles = ["admin", "agent"],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("Users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const role = data?.role || "agent";

      if (!allowedRoles.includes(role)) {
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) return <Loader />;

  return <>{children}</>;
}
