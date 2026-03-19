export async function checkAuth() {
  try {
    const res = await fetch("http://localhost:8000/api/auth/check/", {
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