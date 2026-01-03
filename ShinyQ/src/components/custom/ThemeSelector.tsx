import { useEffect, useState } from "react";
import { Paintbrush } from "lucide-react";
import { colorPalettes } from "@/data/colorPalettes";

export default function ThemeSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState("default");
    const [mounted, setMounted] = useState(false);

    function applyTheme(themeKey: string) {
        const palette = colorPalettes[themeKey];
        if (!palette) { return; }

        const isDark = document.documentElement.classList.contains("dark");
        const colors = isDark ? palette.dark : palette.light;

        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
        });

        if (typeof window !== "undefined") {
            localStorage.setItem("colorTheme", themeKey);
        }
        setCurrentTheme(themeKey);
    }

    useEffect(() => {
        setMounted(true);
        // Get initial theme from localStorage
        const savedTheme = localStorage.getItem("colorTheme") ?? "default";
        setCurrentTheme(savedTheme);
    }, []);

    useEffect(() => {
        if (!mounted) { return; }

        // Listen for theme toggle events
        const handleThemeChange = () => {
            applyTheme(currentTheme);
        };

        document.addEventListener("themeChange", handleThemeChange);

        return () => {
            document.removeEventListener("themeChange", handleThemeChange);
        };
    }, [currentTheme, mounted]);

    if (!mounted) {
        return (
            <button
                className="theme-selector p-2 rounded-lg border border-border hover:border-primary transition-colors bg-card text-card-foreground"
                aria-label="Change color theme"
            >
                <Paintbrush className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
        );
    }

    return (
        <div className="relative theme-selector">
            <button
                id="theme-button"
                className="p-2 rounded-lg border border-border hover:border-primary transition-colors bg-card text-card-foreground"
                aria-label="Change color theme"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Paintbrush className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>

            {isOpen && (
                <div
                    id="theme-dropdown"
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-lg"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="theme-button"
                >
                    <div className="p-2">
                        <h3 className="text-sm font-medium mb-2 px-2">Anime Theme</h3>
                        <div className="space-y-1">
                            {Object.entries(colorPalettes).map(([key, palette]) => (
                                <button
                                    key={key}
                                    className={`theme-option w-full flex items-center gap-2 p-2 rounded-md transition-colors ${
                                        currentTheme === key
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-accent/10"
                                    }`}
                                    onClick={() => {
                                        applyTheme(key);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex gap-1">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: `hsl(${palette.dark.primary})` }}
                                        />
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: `hsl(${palette.dark.accent})` }}
                                        />
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: `hsl(${palette.dark.secondary})` }}
                                        />
                                    </div>
                                    <span className="text-sm">{palette.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 