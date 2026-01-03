import { Variants } from "framer-motion";

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

export const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 40
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    },
    exit: {
        opacity: 0,
        y: -30, // exits upward
        transition: {
            duration: 0.25,
            ease: "easeIn"
        }
    }
};

export const dotVariants: Variants = {
    hidden: {
        scale: 0.5,
        opacity: 0,
        y: 10
    },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.4
        }
    }
};
