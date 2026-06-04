import { useEffect } from "react";

let bodyLockCount = 0;
let originalOverflow = "";

export function useLockBodyScroll() {
  useEffect(() => {
    if (bodyLockCount === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    bodyLockCount++;

    return () => {
      bodyLockCount--;

      if (bodyLockCount <= 0) {
        bodyLockCount = 0;
        document.body.style.overflow = originalOverflow;
      }
    };
  }, []);
}