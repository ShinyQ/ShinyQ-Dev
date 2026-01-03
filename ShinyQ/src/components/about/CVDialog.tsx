'use client';

import { Button } from "@/components/ui/button";
import { EyeIcon, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogHeader,
    DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface ErrorDisplayProps {
    error: string | null;
}

const CV_URL = "/cv.pdf";

const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to Load CV</h3>
        <p className="text-gray-500">{error ?? "The CV file is currently unavailable. Please try again later."}</p>
    </div>
);

export default function CVDialog() {
    const [isMobile, setIsMobile] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .pdf-container iframe {
                border: none;
            }
            .pdf-container iframe::-webkit-scrollbar {
                display: none;
            }
            .pdf-container iframe {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleOpenCV = () => {
        if (isMobile) {
            window.open(CV_URL, '_blank');
        }
    };

    if (isMobile) {
        return (
            <Button
                className="bg-gradient-to-r from-primary via-primary/90 to-accent/90 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                onClick={handleOpenCV}
            >
                View CV
                <EyeIcon className="ml-2 w-5 h-5" />
            </Button>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="bg-gradient-to-r from-primary via-primary/90 to-accent/90 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    onClick={() => setError(null)}
                >
                    View CV
                    <EyeIcon className="ml-2 w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl sm:max-w-4xl h-[80vh] max-h-[90vh] border border-border shadow-xl rounded-lg p-0">
                <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-semibold">
                        Curriculum Vitae - Kurniadi Ahmad Wijaya
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        View my curriculum vitae in a modal window
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full h-[70vh] sm:h-[80vh] overflow-auto pdf-container">
                    {error ? (
                        <ErrorDisplay error={error} />
                    ) : (
                        <iframe
                            src={`${CV_URL}#toolbar=0&navpanes=0`}
                            className="w-full h-full rounded"
                            title="Resume"
                            style={{ minHeight: 400 }}
                            onError={() => {
                                const errorMessage = "Failed to load CV. Please try again later.";
                                setError(errorMessage);
                            }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 