import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

/**
 * Typed getter for MMKV-stored values.
 * Automatically parses stored JSON into the correct type.
 */
export function getItem<T>(key: string): T | null {
  try {
    const value = storage.getString(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.warn(`[MMKV] Failed to parse value for key "${key}"`, error);
    return null;
  }
}

/**
 * Typed setter for MMKV-stored values.
 * Automatically stringifies values before saving.
 */
export function setItem<T>(key: string, value: T): void {
  try {
    const json = JSON.stringify(value);
    storage.set(key, json);
  } catch (error) {
    console.warn(`[MMKV] Failed to stringify value for key "${key}"`, error);
  }
}

/**
 * Optional utility for clearing all stored values (useful for onboarding resets)
 */
export function clearAll(): void {
  storage.clearAll();
}
