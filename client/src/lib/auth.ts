import { User } from "@/hooks/use-auth";

export interface AuthResponse {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'company' | 'supplier' | 'ngo';
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateRegistrationData = (data: RegisterData): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!data.username.trim()) {
    errors.username = "Username is required";
  } else if (data.username.length < 3) {
    errors.username = "Username must be at least 3 characters long";
  }
  
  if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.errors[0];
  }
  
  if (!data.role) {
    errors.role = "Please select a role";
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'company':
      return 'Construction Company';
    case 'supplier':
      return 'Supplier/Contractor';
    case 'ngo':
      return 'NGO';
    case 'admin':
      return 'Administrator';
    default:
      return role;
  }
};

export const getUserInitials = (username: string): string => {
  return username
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const isAuthorizedForAction = (userRole: string, action: string): boolean => {
  const permissions = {
    'post_project': ['company', 'ngo'],
    'submit_bid': ['supplier'],
    'award_bid': ['company', 'ngo'],
    'view_all_projects': ['admin'],
    'verify_users': ['admin'],
    'manage_disputes': ['admin'],
  };
  
  return permissions[action as keyof typeof permissions]?.includes(userRole) || false;
};

export const formatUserRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};
