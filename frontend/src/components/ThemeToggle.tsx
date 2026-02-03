import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = ({ variant = "default" }: { variant?: "default" | "dock" }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  if (variant === "dock") {
    return (
      <button
        onClick={toggleTheme}
        className="group relative p-2 rounded-xl transition-all duration-300 hover:bg-white/10 hover:scale-110"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-white/80" />
        ) : (
          <Moon className="w-5 h-5 text-white/80" />
        )}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium 
                         bg-foreground/90 text-white rounded-md opacity-0 group-hover:opacity-100 
                         transition-opacity duration-200 whitespace-nowrap pointer-events-none dark:bg-white/90 dark:text-foreground">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-muted/50 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-foreground/80" />
      ) : (
        <Moon className="w-5 h-5 text-foreground/80" />
      )}
    </button>
  );
};

export default ThemeToggle;
