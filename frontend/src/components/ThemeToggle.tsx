import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { toggleTheme } from "../store/theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  }, []);

  const handleClick = () => {
    toggleTheme();
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  };

  return (
    <button
      onClick={handleClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
      aria-label="Đổi giao diện tối / sáng"
    >
      {isDark ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5 text-amber-500" />
      )}
    </button>
  );
}
