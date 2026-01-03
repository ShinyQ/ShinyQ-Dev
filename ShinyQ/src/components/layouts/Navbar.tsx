'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import ThemeToggle from '@/components/custom/ThemeToggle';
import ThemeSelector from '@/components/custom/ThemeSelector';

const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Journey', path: '/journey' },
    { name: 'Blog', path: '/blog' },
    { name: 'Projects', path: '/projects' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [mobileMenuOpen]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || mobileMenuOpen
                    ? 'bg-background/90 backdrop-blur-md border-b border-border'
                    : ''
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-primary">
                            <span className="text-primary">&gt;</span> ShinyQ
                            <span className="text-primary">_</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex items-center gap-2">
                            <ThemeSelector />
                            <ThemeToggle />
                        </div>
                    </nav>

                    {/* Mobile Navigation Toggle */}
                    <div className="flex items-center md:hidden gap-4">
                        <div className="relative z-50 flex items-center gap-2">
                            <ThemeSelector />
                            <ThemeToggle />
                        </div>
                        <button
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                            className="text-foreground bg-transparent border-none p-2 z-50"
                            aria-expanded={mobileMenuOpen}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <nav
                className={`md:hidden py-4 px-4 bg-background/95 backdrop-blur-md border-b border-border ${mobileMenuOpen ? '' : 'hidden'
                    }`}
                aria-hidden={!mobileMenuOpen}
            >
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                href={item.path}
                                onClick={closeMobileMenu}
                                className={`block py-2 px-4 rounded-md ${isActive(item.path)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground/80 hover:text-foreground'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
