// Mobile device detection
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Check if touch device
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ((navigator as unknown) as { msMaxTouchPoints?: number }).msMaxTouchPoints! > 0
  );
}

// Get device orientation
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

// Check if PWA installed
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ((window.navigator as unknown) as { standalone?: boolean }).standalone === true
  );
}

// Haptic feedback (vibration)
export function hapticFeedback(pattern: number | number[] = 10): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Haptic feedback not supported:', error);
  }
}

// Request camera permission
export async function requestCameraPermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('mediaDevices' in navigator)) {
    return false;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop the stream immediately
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}

// Open camera for photo capture
export async function capturePhoto(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      resolve(file || null);
    };
    
    input.oncancel = () => {
      resolve(null);
    };
    
    input.click();
  });
}

// Compress image before upload
export async function compressImage(
  file: File,
  maxWidthOrHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Prevent zoom on double tap (iOS)
export function preventDoubleTapZoom() {
  if (typeof document === 'undefined') return;
  
  let lastTouchEnd = 0;
  
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

// Scroll to element smoothly
export function scrollToElement(elementId: string, offset: number = 0): void {
  if (typeof window === 'undefined') return;
  
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}

// Lock screen orientation (when possible)
export async function lockOrientation(orientation: 'portrait' | 'landscape'): Promise<boolean> {
  if (typeof screen === 'undefined' || !('orientation' in screen)) {
    return false;
  }
  
  try {
    await ((screen.orientation as unknown) as { lock: (o: 'portrait' | 'landscape') => Promise<void> }).lock(orientation);
    return true;
  } catch (error) {
    console.warn('Screen orientation lock not supported:', error);
    return false;
  }
}

// Unlock screen orientation
export function unlockOrientation(): void {
  if (typeof screen === 'undefined' || !('orientation' in screen)) {
    return;
  }
  
  try {
    ((screen.orientation as unknown) as { unlock: () => void }).unlock();
  } catch (error) {
    console.warn('Screen orientation unlock not supported:', error);
  }
}

// Share via native share API
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('share' in navigator)) {
    return false;
  }
  
  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
}

// Add to home screen prompt
export function showAddToHomeScreen(): void {
  // This is handled by the PWAInstaller component
  // but can be triggered programmatically
  window.dispatchEvent(new CustomEvent('show-pwa-prompt'));
}

// Network information
export function getNetworkInfo(): {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
} | null {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return null;
  }
  
  const connection = (navigator as unknown as { connection?: Partial<{ type: string; effectiveType: string; downlink: number; rtt: number }> }).connection || {};
  
  return {
    type: connection.type || 'unknown',
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
  };
}

// Check if slow network
export function isSlowNetwork(): boolean {
  const info = getNetworkInfo();
  if (!info) return false;
  
  return info.effectiveType === '2g' || info.effectiveType === 'slow-2g';
}
