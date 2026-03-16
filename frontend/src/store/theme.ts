// frontend/src/store/theme.ts
import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme-preference";

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;

  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

// Gọi lúc khởi động app
export function initTheme() {
  const theme = getInitialTheme();
  applyTheme(theme);
}

// Dùng cho nút toggle
export function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const next: Theme = isDark ? "light" : "dark";

  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
}

// Hook "giả store" để Navbar / component khác dùng được như cũ
export function useThemeStore() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    const update = () => {
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    };

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    update();

    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    toggleTheme();
    const root = document.documentElement;
    setTheme(root.classList.contains("dark") ? "dark" : "light");
  };

  return {
    theme,
    toggleTheme: toggle,
  };
}
