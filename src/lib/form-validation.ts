import * as z from 'zod';

// Phone number validation with helpful messages
export const phoneSchema = z.string().optional().refine(
  (phone) => {
    if (!phone || phone.trim() === '') return true;
    // Allow +61 format or 10 digits
    const cleaned = phone.replace(/\s/g, '');
    return /^(\+61|0)[0-9]{9}$/.test(cleaned) || /^[0-9]{10}$/.test(cleaned);
  },
  {
    message: 'Enter 10 digits or +61 format (e.g., 0412 345 678 or +61 412 345 678)',
  }
);

// Fleet number validation
export const fleetNumberSchema = z.string().min(1, 'Fleet number is required');

// Description validation with character count
export function getDescriptionError(description: string | undefined, minLength = 10): string | null {
  if (!description || description.trim().length === 0) {
    return 'Description is required';
  }
  if (description.trim().length < minLength) {
    const remaining = minLength - description.trim().length;
    return `Add ${remaining} more character${remaining > 1 ? 's' : ''} to help the workshop (${description.trim().length}/${minLength})`;
  }
  return null;
}

// Date validation - future dates only
export const futureDateSchema = z.string().optional().refine(
  (date) => {
    if (!date || date.trim() === '') return true;
    const selectedDate = new Date(date);
    const now = new Date();
    return selectedDate > now;
  },
  {
    message: 'Preferred time should be in the future',
  }
);

// Registration plate formatting
export function formatRegistration(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Phone number formatting
export function formatPhoneNumber(input: string): string {
  const cleaned = input.replace(/\D/g, '');
  
  // Format as 0XXX XXX XXX
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  } else if (cleaned.length <= 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return cleaned.slice(0, 10);
}

// Auto-detect severity from description keywords
export function detectSeverity(description: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null {
  if (!description) return null;
  
  const lower = description.toLowerCase();
  
  // Critical keywords
  if (
    lower.includes('stopped') ||
    lower.includes('won\'t start') ||
    lower.includes('unsafe') ||
    lower.includes('dangerous') ||
    lower.includes('fire') ||
    lower.includes('smoke') ||
    lower.includes('can\'t move') ||
    lower.includes('broke down')
  ) {
    return 'CRITICAL';
  }
  
  // High severity keywords
  if (
    lower.includes('brakes') ||
    lower.includes('steering') ||
    lower.includes('engine') ||
    lower.includes('warning light') ||
    lower.includes('overheating') ||
    lower.includes('leak')
  ) {
    return 'HIGH';
  }
  
  // Medium severity keywords
  if (
    lower.includes('noise') ||
    lower.includes('vibration') ||
    lower.includes('smell') ||
    lower.includes('dashboard')
  ) {
    return 'MEDIUM';
  }
  
  return null;
}

// Suggest category from description
export function suggestCategory(description: string): string | null {
  if (!description) return null;
  
  const lower = description.toLowerCase();
  
  if (
    lower.includes('engine') ||
    lower.includes('motor') ||
    lower.includes('start')
  ) {
    return 'Mechanical';
  }
  
  if (
    lower.includes('light') ||
    lower.includes('electrical') ||
    lower.includes('battery') ||
    lower.includes('alternator')
  ) {
    return 'Electrical';
  }
  
  if (
    lower.includes('brake') ||
    lower.includes('braking')
  ) {
    return 'Brakes';
  }
  
  if (
    lower.includes('tyre') ||
    lower.includes('tire') ||
    lower.includes('wheel')
  ) {
    return 'Tyres';
  }
  
  if (
    lower.includes('body') ||
    lower.includes('door') ||
    lower.includes('panel') ||
    lower.includes('damage')
  ) {
    return 'Body';
  }
  
  return null;
}

// Validate file upload
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  options?: { maxSizeMB?: number; allowedTypes?: readonly string[] }
): FileValidationResult {
  const maxSizeMB = options?.maxSizeMB ?? 10;
  const allowedTypes =
    options?.allowedTypes ?? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];

  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  
  // Check size
  if (file.size > maxSize) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `Photo is ${fileSizeMB}MB. Max is ${maxSizeMB}MB. Try reducing quality.`,
    };
  }
  
  // Check type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, WEBP, GIF, MP4, MOV, or AVI files.',
    };
  }
  
  return { valid: true };
}

// Check if form has unsaved changes
export function hasUnsavedChanges(formData: Record<string, unknown>, savedData: Record<string, unknown> | null): boolean {
  if (!savedData) return false;
  
  // Compare key fields
  const importantFields = ['fleetNumber', 'category', 'description', 'severity'];
  
  for (const field of importantFields) {
    if (formData[field] !== savedData[field]) {
      return true;
    }
  }
  
  return false;
}
