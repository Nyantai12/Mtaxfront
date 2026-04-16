import { API_BASE_URL } from "@/api_base_url/page";
export default async function AuthCheck() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/check/`, {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok && data.authenticated) {
      return {
        isAuthenticated: true,
        userId: data.user_id
      };
    }

    return {
      isAuthenticated: false
    };
  } catch (err) {
    console.error("Auth шалгах алдаа:", err);
    return {
      isAuthenticated: false
    };
  }
}