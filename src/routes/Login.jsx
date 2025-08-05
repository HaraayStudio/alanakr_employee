// src/pages/Login.jsx
import React, { useState } from "react";
import styles from "./Login.module.scss";
import logo from "../assets/logo.png";
import { useData } from "../context/dataContext"; 

export default function Login() {
  const { handleLogin } = useData(); // <-- Use context
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(""); // Add to show API errors

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    setApiError(""); // Clear API errors
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 1) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");
    try {
      // Use email as username (update if your API uses a different field)
      const res = await handleLogin(formData.username, formData.password);

      if (res.success) {
        // Redirect to dashboard, etc.
      window.location.href = "/home";
        console.log(res);
        
      } else {
        setApiError(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <img src={logo} alt="Alankar Logo" className={styles.logo} />
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
              placeholder="Enter your username"
              autoComplete="username"
            />
            {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
          </div>

          {apiError && (
            <div className={styles.apiError}>
              {apiError}
            </div>
          )}

          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" className={styles.checkbox} />
              <span className={styles.checkboxText}>Remember me</span>
            </label>
            <a href="#" className={styles.forgotPassword}>Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.loginBtn} ${isLoading ? styles.loading : ""}`}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{" "}
            <a href="#" className={styles.signupLink}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
