// auth.js

// Check user's auth state on page load
async function checkAuthState() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // User is logged in
    console.log("User is logged in:", session.user.email);
    
    // If on signup/login page, redirect to main app
    if (window.location.pathname.includes('signup') || window.location.pathname.includes('login')) {
      window.location.href = "index.html";
    }
  } else {
    // User is NOT logged in
    console.log("User is not logged in");
    
    // If on app pages, redirect to signup
    if (window.location.pathname.includes('index') || 
        window.location.pathname.includes('profile') || 
        window.location.pathname.includes('tasks') ||
        window.location.pathname.includes('stats') ||
        window.location.pathname.includes('values')) {
      window.location.href = "signup.html";
    }
  }
}

// 1. Sign Up Function
async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    alert("Sign Up Error: " + error.message);
    return null;
  }
  
  alert("Sign up successful! Please check your email for verification if enabled.");
  // Redirect to main app after signup
  window.location.href = "index.html";
  return data;
}

// 2. Login Function
async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert("Login Error: " + error.message);
    return null;
  }

  // Redirect to dashboard after successful login
  window.location.href = "index.html"; 
  return data;
}

// 3. Logout Function
async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Error logging out: " + error.message);
  } else {
    window.location.href = "signup.html"; // Redirect to signup
  }
}

// 4. Protection Check for Dashboard/Private Pages
async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Redirect unauthenticated users to signup page
    window.location.href = "signup.html";
  } else {
    return session.user;
  }
}

// Run auth check when page loads
document.addEventListener("DOMContentLoaded", checkAuthState);
