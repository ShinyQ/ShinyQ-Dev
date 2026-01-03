'use client';

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("theme");
        if (saved) {
            setIsDark(saved === "dark");
        } else {
            setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", isDark ? "dark" : "light");
        
        // Dispatch theme change event
        document.dispatchEvent(new Event("themeChange"));
    }, [isDark, mounted]);

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted/50 p-2 w-9 h-9"
                aria-label="Toggle theme"
            >
                <div className="w-5 h-5" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted/50 p-2 w-9 h-9"
            aria-label="Toggle theme"
            onClick={() => setIsDark(prev => !prev)}
        >
            {isDark ? (
                <Sun size={20} className="text-yellow-400 dark:text-yellow-300" />
            ) : (
                <Moon size={20} className="text-slate-700 dark:text-slate-200" />
            )}
        </Button>
    );
}
