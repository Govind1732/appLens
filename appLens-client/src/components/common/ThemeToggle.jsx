import { useState, useEffect, useCallback, useMemo } from "react";
import { Sun, Moon } from "lucide-react";

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && ["light", "dark"].includes(savedTheme)) {
      return savedTheme;
    }

    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
  } catch (error) {
    console.warn("Could not determine initial theme:", error);
  }
  return "light"; // Default theme
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only update if no theme is saved in localStorage
      try {
        if (!localStorage.getItem("theme")) {
          setTheme(e.matches ? "dark" : "light");
        }
      } catch (error) {
        console.warn("Error accessing localStorage:", error);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme changes
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
      const root = document.documentElement;

      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } catch (error) {
      console.warn("Error saving theme to localStorage:", error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  const tooltip = useMemo(() => {
    return theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="
        inline-flex items-center justify-center
        w-12 h-12 rounded-lg
        bg-white
        dark:bg-[#1b1c1d]
        shadow-sm
        transition-all duration-200 ease-in-out
        cursor-pointer
        active:scale-95
      "
      title={tooltip}
      aria-label={tooltip}
      type="button"
    >
      {/* Enhanced Icon Animation Container */}
      <div className="relative w-5 h-5 overflow-hidden">
        <Sun
          className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ease-in-out transform ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-50 opacity-0"
          } hover:scale-110`}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 text-blue-600 dark:text-blue-400 transition-all duration-300 ease-in-out transform ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-50 opacity-0"
          } hover:scale-110`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
