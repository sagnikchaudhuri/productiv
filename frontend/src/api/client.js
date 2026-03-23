import BASE_URL from "./api/config"

// 🔐 Simple token storage
export const tokenStore = {
  get: () => localStorage.getItem("token"),
  set: (token) => localStorage.setItem("token", token),
  clear: () => localStorage.removeItem("token"),
}

const api = {
  auth: {
    // ✅ REGISTER (JSON)
    register: async (name, email, password) => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || "Registration failed")
      }

      return await res.json()
    },

    // ✅ LOGIN (FORM-DATA for FastAPI OAuth)
    login: async (email, password) => {
      const body = new URLSearchParams()
      body.append("username", email)   // IMPORTANT
      body.append("password", password)

      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || "Login failed")
      }

      const data = await res.json()
      tokenStore.set(data.access_token)
      return data
    },

    // ✅ GET CURRENT USER
    me: async () => {
      const token = tokenStore.get()

      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        tokenStore.clear()
        throw new Error("Not authenticated")
      }

      return await res.json()
    },

    // ✅ LOGOUT
    logout: () => {
      tokenStore.clear()
    },
  },
}

export default api
