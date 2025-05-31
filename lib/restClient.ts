import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { Session } from "next-auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const restClient = axios.create({
  baseURL,
  timeout: 10000, // 10 detik
  headers: {
    "Content-Type": "application/json",
    // "Cache-Control": "no-store", // Menonaktifkan caching
  },
});

// Session cache to prevent multiple calls to getSession()
let sessionCache: Session | null = null;
let sessionExpiry: number = 0;
const SESSION_CACHE_DURATION = 30000; // 30 seconds

// Function to get session with caching
const getCachedSession = async (): Promise<Session | null> => {
  const now = Date.now();
  // Return cached session if it's still valid
  if (sessionCache && now < sessionExpiry) {
    return sessionCache;
  }

  // Otherwise fetch a new session
  const session = await getSession();
  sessionCache = session;
  sessionExpiry = now + SESSION_CACHE_DURATION;
  return session;
};

// Tambahkan interceptor untuk request
restClient.interceptors.request.use(
  async (config) => {
    const session = await getCachedSession(); // Use cached session
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    console.log("Request Interceptor Error: ", error);
    return Promise.reject(error); // Menjaga agar error tetap diteruskan
  }
);

// Tambahkan interceptor untuk response
restClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Ada response error dari server
      console.log("Axios Error Response: ", error.response.data);

      // Handle unauthorized errors (token expired)
      if (error.response.status === 401) {
        console.log("Unauthorized request detected, checking session...");

        // Check if we have a valid session before signing out
        const session = await getCachedSession();
        
        // Invalidate session cache on 401 to force fresh session check next time
        sessionCache = null;
        sessionExpiry = 0;

        // Only sign out if there's no session or the token is expired
        if (!session || !session.accessToken) {
          console.log("No valid session found. Redirecting to login...");
          // Sign out and redirect to login page
          signOut({ callbackUrl: "/" });
        } else {
          console.log(
            "Session exists but request unauthorized. Possible API permission issue."
          );
          // We have a session but got 401 - might be a specific API permission issue
          // not a token expiration, so don't sign out automatically
        }
      }
    } else if (error.request) {
      // Tidak ada response dari server (misalnya timeout)
      console.log("Axios Error Request: ", error.request);
    } else {
      // Error lain yang tidak terduga
      console.log("Axios General Error: ", error.message);
    }

    return Promise.reject(error); // Tetap lempar error agar bisa di-handle di component
  }
);

export default restClient;
