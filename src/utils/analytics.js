// src/utils/analytics.js
export function track(eventName, params = {}) {
  // gtag só existe depois que o script do GA carrega
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    ...params,
  });
}

export function trackPageView(path) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_path: path,
  });
}

