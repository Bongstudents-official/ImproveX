// auth.js

// Helper to reliably access Supabase client
function getClient() {
  return window.supabaseClient || window.supabase;
}

/**
 * 1. Sign Up User & Create Default Profile
 */
async function signUpUser(email, password) {
  const client = getClient();
  if (!client) return { error: { message: "Supabase client not initialized." } };

  const { data, error } = await client.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    alert("Sign Up Error: " + error.message);
    return { data: null, error };
  }

  // Handle Profile Creation after Successful Registration
  if (data?.user) {
    const { error: profileError } = await client
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        created_at: new Date().toISOString(),
        xp: 0,
        level: 1,
        streak: 0
      }, { onConflict: 'id' });

    if (profileError) {
      console.warn("Profile creation note:", profileError.message);
    }
  }

  alert("Sign up successful! Check your email for verification if required.");
  return { data, error: null };
}

/**
 * 2. Login User
 */
async function loginUser(email, password) {
  const client = getClient();
  if (!client) return { error: { message: "Supabase client not initialized." } };

  const { data, error } = await client.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert("Login Error: " + error.message);
    return { data: null, error };
  }

  // Corrected redirect to index.html dashboard
  window.location.href = "index.html";
  return { data, error: null };
}

/**
 * 3. Logout User
 */
async function logoutUser() {
  const client = getClient();
  if (!client) return;

  const { error } = await client.auth.signOut();
  if (error) {
    alert("Error logging out: " + error.message);
  } else {
    window.location.href = "login.html";
  }
}

/**
 * 4. Route Protection for Protected Pages
 * Call this on index.html, tasks.html, stats.html, values.html, profile.html
 */
async function requireAuth() {
  const client = getClient();
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
  } else {
    return session.user;
  }
}

/**
 * 5. Auth Redirect Guard for Public Pages (login.html, signup.html)
 * Redirects already authenticated users away from login/signup to index.html
 */
async function redirectIfAuthenticated() {
  const client = getClient();
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (session) {
    window.location.href = "index.html";
  }
}

/**
 * 6. Global Auth State Listener
 * Listens for token refreshes, logouts, and sign-ins automatically across tabs.
 */
document.addEventListener("DOMContentLoaded", () => {
  const client = getClient();
  if (!client) return;

  client.auth.onAuthStateChange((event, session) => {
    const publicPages = ["login.html", "signup.html"];
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    if (event === "SIGNED_OUT" && !publicPages.includes(currentPage)) {
      window.location.href = "login.html";
    }
  });
});
