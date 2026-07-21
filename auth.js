// auth.js

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
  window.location.href = "dashboard.html"; 
  return data;
}

// 3. Logout Function
async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Error logging out: " + error.message);
  } else {
    window.location.href = "login.html"; // Redirect to login page
  }
}

// 4. Protection Check for Dashboard/Private Pages
async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Redirect unauthenticated users to login page
    window.location.href = "login.html";
  } else {
    return session.user;
  }
}