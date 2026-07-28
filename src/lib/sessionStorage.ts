export function getSessionItem(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function removeSessionItem(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}

export function setSessionItem(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Navigation and core interactions must keep working without storage.
  }
}
