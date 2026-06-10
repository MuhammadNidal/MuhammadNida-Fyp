export type ValidationResult = {
  valid: boolean;
  message?: string;
};

export function validateLogin(email: string, password: string): ValidationResult {
  if (!email || !password) {
    return { valid: false, message: "Please enter your email and password" };
  }

  const normalized = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, message: "Please enter a valid email address" };
  }

  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }

  return { valid: true };
}

export default { validateLogin };
