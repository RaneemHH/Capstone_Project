import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { useUserProfileStore } from "./user-profile-store";

function isValidJWT(token: string | undefined): token is string {
  return !!token && typeof token === "string" && token.split(".").length === 3;
}

// interface Role {
//   id: number;
//   code: string;
//   name: string;
//   description: string;
// }

interface AccessTokenPayload {
  roles: string[]; // JWT has roles as string array, not objects
  userId: number;
  sub: string;
  iat: number;
  exp: number;
}

interface AuthState {
  // Raw token strings for API authorization
  accessTokenString: string | null;
  refreshTokenString: string | null;

  // Decoded payload for easy access to user info
  accessToken: AccessTokenPayload | null;
  roles: string[];

  // Actions
  setToken: (accessToken?: string, refreshToken?: string) => void;
  logout: () => void;
}

// Initialize from localStorage
const initializeAuth = (): Pick<AuthState, 'accessTokenString' | 'refreshTokenString' | 'accessToken' | 'roles'> => {
  const storedAccessToken = localStorage.getItem("accessToken") || undefined;
  const storedRefreshToken = localStorage.getItem("refreshToken") || undefined;

  if (isValidJWT(storedAccessToken)) {
    try {
      const decoded = jwtDecode<AccessTokenPayload>(storedAccessToken);
      const roles = decoded.roles || [];

      // Fetch user profile on initialization
      useUserProfileStore.getState().fetchUserProfile(decoded.userId);

      return {
        accessTokenString: storedAccessToken,
        refreshTokenString: storedRefreshToken || null,
        accessToken: decoded,
        roles,
      };
    } catch {
      return {
        accessTokenString: null,
        refreshTokenString: null,
        accessToken: null,
        roles: [],
      };
    }
  }

  return {
    accessTokenString: null,
    refreshTokenString: null,
    accessToken: null,
    roles: [],
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initializeAuth(),

  setToken: (token, refreshToken) => {
    if (!isValidJWT(token)) {
      set({
        accessTokenString: null,
        refreshTokenString: null,
        accessToken: null,
        roles: []
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return;
    }

    try {
      const decoded = jwtDecode<AccessTokenPayload>(token);
      const roles = decoded.roles || [];

      set({
        accessTokenString: token,
        refreshTokenString: refreshToken || null,
        accessToken: decoded,
        roles,
      });

      localStorage.setItem("accessToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      } else {
        // If no refresh token provided (like in Google OAuth), remove it
        localStorage.removeItem("refreshToken");
      }

      // Fetch user profile after setting token
      useUserProfileStore.getState().fetchUserProfile(decoded.userId);
    } catch (error) {
      console.error("Failed to decode token:", error);
      set({
        accessTokenString: null,
        refreshTokenString: null,
        accessToken: null,
        roles: []
      });
    }
  },

  logout: () => {
    set({
      accessTokenString: null,
      refreshTokenString: null,
      accessToken: null,
      roles: []
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Clear user profile on logout
    useUserProfileStore.getState().clearUserProfile();
  },
}));