import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits');

export const urlSchema = z.string().url('Please enter a valid URL');

// Form validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters'),
    email: emailSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    teacherId: z.string().min(1, 'Teacher ID is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.string().min(1, 'Role is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// Utility functions
export const validateEmail = email => {
  try {
    emailSchema.parse(email);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

export const validatePassword = password => {
  try {
    passwordSchema.parse(password);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

export const validateName = name => {
  try {
    nameSchema.parse(name);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

export const validatePhone = phone => {
  try {
    phoneSchema.parse(phone);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

export const validateUrl = url => {
  try {
    urlSchema.parse(url);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

// Password strength checker
export const checkPasswordStrength = password => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  if (score < 3) return { strength: 'weak', score, color: 'red' };
  if (score < 5) return { strength: 'medium', score, color: 'yellow' };
  return { strength: 'strong', score, color: 'green' };
};
