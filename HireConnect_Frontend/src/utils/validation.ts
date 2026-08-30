export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordStrength(password: string): { score: 0 | 1 | 2 | 3; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return { score: score as 0 | 1 | 2 | 3, label: labels[score] };
}

export const errorMessages = {
  required: 'This field is required.',
  invalidEmail: 'Invalid email address.',
  passwordLength: 'Password must contain at least 8 characters.',
  passwordMismatch: 'Passwords do not match.',
  termsRequired: 'You must accept the terms to continue.',
  salaryOrder: 'Maximum salary must be greater than minimum salary.',
  resumeRequired: 'Resume is required.',
};
