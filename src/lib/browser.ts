const BROWSER_COMPAT_DISMISSED_KEY = "antimony-browser-compat-dismissed";

type NavigatorBrand = {
  brand: string;
  version: string;
};

type NavigatorWithUAData = Navigator & {
  userAgentData?: {
    brands?: NavigatorBrand[];
  };
};

export function isDesktopApp(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function isChromiumBrowser(): boolean {
  if (typeof navigator === "undefined") {
    return true;
  }

  const brands = (navigator as NavigatorWithUAData).userAgentData?.brands;
  if (brands) {
    return brands.some(
      (brand: NavigatorBrand) =>
        brand.brand === "Chromium" ||
        brand.brand === "Google Chrome" ||
        brand.brand === "Microsoft Edge" ||
        brand.brand === "Opera",
    );
  }

  const ua = navigator.userAgent;
  const isFirefox = ua.includes("Firefox") || ua.includes("FxiOS");
  const isSafari =
    !ua.includes("Chrome") &&
    !ua.includes("Chromium") &&
    !ua.includes("Edg") &&
    ua.includes("Safari");

  if (isFirefox || isSafari) {
    return false;
  }

  return (
    ua.includes("Chrome") ||
    ua.includes("Chromium") ||
    ua.includes("Edg") ||
    ua.includes("OPR") ||
    ua.includes("Opera")
  );
}

export function shouldShowBrowserCompatWarning(): boolean {
  if (isDesktopApp() || isChromiumBrowser()) {
    return false;
  }

  try {
    return localStorage.getItem(BROWSER_COMPAT_DISMISSED_KEY) !== "1";
  } catch {
    return true;
  }
}

export function dismissBrowserCompatWarning(): void {
  try {
    localStorage.setItem(BROWSER_COMPAT_DISMISSED_KEY, "1");
  } catch {}
}
