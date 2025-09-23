// Import necessary hooks and components
import { useState, useEffect } from "react";
import { registerLicense } from '@syncfusion/ej2-base';
import DocumentEditorMain from "./DocumentEditor";

// Register the Syncfusion license key
registerLicense("Ngo9BigBOggjHTQxAR8/V1NNaF5cXGhIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEBjWH1ecXxWRWVbUExyVklfag==");

const hostURL = "https://localhost:44310/api/authentication";

// Authenticating the users with the credentials like Email ID and password. Registering new users.
function Authentication() {
  // State hooks for managing authentication
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");

  // Effect to load user from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  // Logout user and clear state
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Validate email format using a regular expression
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Handle login form submission
  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value.trim();

    if (!validateEmail(email)) {
      setMessage("❌ Please enter a valid email.");
      return;
    }

    try {
      // Make a POST request to the login API
      const response = await fetch(`${hostURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData); // Update user state directly
      } else {
        setMessage("❌ Invalid email or password.");
      }
    } catch (error) {
      setMessage("⚠️ Server error during login.");
    }
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    const form = e.currentTarget;
    const username = form.elements.username.value;
    const email = form.elements.email.value;
    const password = form.elements.password.value;

    if (!validateEmail(email)) {
      setMessage("❌ Please enter a valid email.");
      return;
    }

    try {
      // Make a POST request to the registration API
      const register = await fetch(`${hostURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await register.json();
      if (register.ok) {
        setMessage("✅ Registration successful. You can now log in.");
        setIsRegister(false);
        setUsername("");
      } else {
        setMessage(`❌ ${data.message || "Registration failed"}`);
      }
    } catch {
      setMessage("⚠️ Server error during registration.");
    }
  };

  // Render authentication form if not logged in
  const renderAuthForm = () => {
    return (
      <div className="auth-container">
        <h2 className="auth-title">{isRegister ? "Register" : "Login"}</h2>
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <>
              <label className="auth-label" htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="auth-input"
                placeholder="Your username"
              />
            </>
          )}
          <label className="auth-label" htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            className="auth-input"
            placeholder="you@example.com"
          />
          <label className="auth-label" htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            name="password"
            required
            className="auth-input"
            placeholder="Your password"
          />
          <button
            type="submit"
            className="auth-button primary"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>
        <button
          className="auth-button secondary"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
            setUsername("");
          }}
          style={{ marginTop: 12, cursor: "pointer" }}
        >
          {isRegister ? "Already have an account? Log in" : "Don't have an account? Register"}
        </button>
        {message && <p className="auth-message" style={{ marginTop: 12 }}>{message}</p>}
      </div>
    );
  };

  // Render DocumentEditorMain if user is authenticated, otherwise render auth form
  return user ? (
    <DocumentEditorMain user={user} onLogout={handleLogout} />
  ) : (
    renderAuthForm()
  );
}

export default Authentication;