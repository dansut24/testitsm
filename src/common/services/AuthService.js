// src/common/services/AuthService.js
import { supabase } from "../utils/supabaseClient";

function normalizeAuthError(error) {
  if (!error) return null;

  const msg = String(error.message || "").toLowerCase();

  // Common supabase auth messages you likely want to show nicely
  if (msg.includes("invalid login credentials")) {
    return { ...error, message: "Incorrect email or password." };
  }

  if (msg.includes("email not confirmed")) {
    return { ...error, message: "Please confirm your email address before signing in." };
  }

  return error;
}

const AuthService = {
  /**
   * Logs in a user using email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{data: any|null, error: any|null}>}
   */
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const nice = normalizeAuthError(error);
        console.error("AuthService signIn error:", nice.message || nice);
        return { data: null, error: nice };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error in signIn:", err);
      return { data: null, error: { message: "Unexpected error occurred." } };
    }
  },

  /**
   * Returns current session (safe wrapper)
   * @returns {Promise<{data: any|null, error: any|null}>}
   */
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return { data: null, error };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: { message: "Failed to read session." } };
    }
  },

  /**
   * Returns current user (safe wrapper)
   * @returns {Promise<{data: any|null, error: any|null}>}
   */
  getUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return { data: null, error };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: { message: "Failed to read user." } };
    }
  },

  /**
   * Logs out the current session
   * @returns {Promise<{error: any|null}>}
   */
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthService logout error:", error.message);
        return { error };
      }
      return { error: null };
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      return { error: { message: "Unexpected error occurred during logout." } };
    }
  },
};

export default AuthService;
