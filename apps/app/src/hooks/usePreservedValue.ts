import { useState } from "react";

export function usePreservedValue<T>(value: T | undefined): T | undefined {
  const [prevValue, setPrevValue] = useState<T | undefined>(value);
  const [cachedValue, setCachedValue] = useState<T | undefined>(value);

  if (value !== prevValue) {
    setPrevValue(value);

    if (value !== undefined) {
      setCachedValue(value);
    }
  }

  return value ?? cachedValue;
}
