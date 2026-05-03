// app/teacher/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    
    if (!userData) {
      router.push("/auth");
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      const userRole = (user.role || user.user_role || "").toLowerCase();
      
      if (userRole !== "teacher" && userRole !== "admin") {
        router.push("/");
        return;
      }
      
      setIsAuthorized(true);
    } catch (error) {
      console.error("Error:", error);
      router.push("/");
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}