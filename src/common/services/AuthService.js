// src/common/services/AuthService.js
import { supabase } from "../utils/supabaseClient";

const AuthService = {
  /**
   * Logs in a user using email and password
   * @param {string} email
   * @param {string} password
   * @returns {object} { data, error }
   */
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("AuthService login error:", error.message);
        return { error };
      }

      return { data };
    } catch (err) {
      console.error("Unexpected error in signIn:", err);
      return { error: { message: "Unexpected error occurred." } };
    }
  },

  /**
   * Logs out the current session
   */
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthService logout error:", error.message);
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  },
};

export default AuthService;
