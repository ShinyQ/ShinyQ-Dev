// Common color properties type
type ColorProperties = {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
};

export type ColorPalette = {
    name: string;
    dark: ColorProperties;
    light: ColorProperties;
};

function createPalette(
    name: string,
    dark: Partial<ColorProperties>,
    light: Partial<ColorProperties>
): ColorPalette {
    const base: Record<keyof ColorProperties, string> = {
        background: "",
        foreground: "",
        card: "",
        cardForeground: "",
        popover: "",
        popoverForeground: "",
        primary: "",
        primaryForeground: "",
        secondary: "",
        secondaryForeground: "",
        muted: "",
        mutedForeground: "",
        accent: "",
        accentForeground: "",
        destructive: "",
        destructiveForeground: "",
        border: "",
        input: "",
        ring: ""
    };

    return {
        name,
        dark: { ...base, ...dark },
        light: { ...base, ...light }
    };
}

export const colorPalettes: Record<string, ColorPalette> = {
    default: createPalette(
        "Bakugo",
        {
            background: "22 15% 10%",               // deep explosive charcoal
            foreground: "30 20% 90%",               // pale ember
            card: "22 15% 12%",                     // scorched surface
            cardForeground: "30 20% 90%",           // ember light
            popover: "22 15% 12%",                  // scorched surface
            popoverForeground: "30 20% 90%",
            primary: "32 100% 50%",                 // explosive orange (his quirk)
            primaryForeground: "0 0% 100%",         // white spark
            secondary: "20 10% 20%",                // burnt leather
            secondaryForeground: "30 20% 90%",
            muted: "22 10% 25%",                    // charcoal rust
            mutedForeground: "35 10% 60%",
            accent: "38 85% 55%",                   // golden explosion
            accentForeground: "0 0% 100%",
            destructive: "0 85% 60%",               // intense red (his rage)
            destructiveForeground: "0 0% 100%",
            border: "20 10% 25%",
            input: "20 10% 20%",
            ring: "32 100% 50%",
        },
        {
            background: "38 50% 97%",               // warm cream (his determination)
            foreground: "20 25% 10%",
            card: "37 70% 95%",
            cardForeground: "20 25% 10%",
            popover: "38 60% 98%",
            popoverForeground: "20 20% 15%",
            primary: "32 100% 50%",
            primaryForeground: "0 0% 100%",
            secondary: "36 30% 88%",
            secondaryForeground: "20 20% 20%",
            muted: "36 20% 85%",                    // soft warm gray
            mutedForeground: "22 10% 35%",
            accent: "38 85% 55%",
            accentForeground: "0 0% 100%",
            destructive: "0 80% 55%",               // controlled rage
            destructiveForeground: "0 0% 100%",
            border: "36 25% 85%",
            input: "36 25% 95%",
            ring: "32 100% 50%",                    // explosive highlight
        }
    ),
    killua: createPalette(
        "Killua",
        {
            background: "240 20% 12%",              // deep cold indigo-black
            foreground: "240 15% 85%",              // icy blue-white text
            card: "240 20% 14%",
            cardForeground: "240 15% 85%",
            popover: "240 20% 14%",
            popoverForeground: "240 15% 85%",
            primary: "235 100% 70%",                // godspeed electric indigo
            primaryForeground: "240 20% 15%",
            secondary: "230 15% 25%",
            secondaryForeground: "240 20% 85%",
            muted: "235 15% 30%",
            mutedForeground: "235 10% 65%",
            accent: "235 100% 75%",
            accentForeground: "240 20% 10%",
            destructive: "340 80% 65%",             // bloody red for danger
            destructiveForeground: "0 0% 100%",
            border: "230 15% 25%",
            input: "230 15% 20%",
            ring: "235 100% 70%",                   // electric ring
        },
        {
            background: "235 60% 98%",              // frosty pale blue
            foreground: "240 20% 15%",
            card: "235 50% 95%",
            cardForeground: "240 20% 15%",
            popover: "235 50% 95%",
            popoverForeground: "240 20% 15%",
            primary: "235 100% 70%",                // godspeed electric indigo
            primaryForeground: "240 20% 15%",
            secondary: "230 30% 88%",
            secondaryForeground: "240 20% 20%",
            muted: "230 25% 85%",
            mutedForeground: "240 10% 40%",
            accent: "235 100% 75%",
            accentForeground: "240 20% 15%",
            destructive: "340 80% 65%",             // bloody red for danger
            destructiveForeground: "0 0% 100%",
            border: "230 20% 80%",
            input: "235 20% 95%",
            ring: "235 100% 70%",                   // godspeed flash
        }
    ),
    karma: createPalette(
        "Karma",
        {
            background: "350 20% 10%",              // dark crimson
            foreground: "0 0% 90%",                 // smirk light
            card: "350 20% 12%",
            cardForeground: "0 0% 90%",
            popover: "350 20% 12%",
            popoverForeground: "0 0% 90%",
            primary: "355 90% 60%",                 // vivid red (dominance)
            primaryForeground: "0 0% 100%",
            secondary: "0 10% 20%",
            secondaryForeground: "0 0% 90%",
            muted: "350 10% 30%",
            mutedForeground: "350 10% 60%",
            accent: "355 90% 65%",                  // golden spark (his intellect, mischief)
            accentForeground: "0 0% 100%",
            destructive: "0 85% 60%",               // bloody red (intimidation mode)
            destructiveForeground: "0 0% 100%",
            border: "0 10% 25%",
            input: "0 10% 20%",
            ring: "355 90% 60%",
        },
        {
            background: "0 60% 98%",                // pale pink-white (fake innocence)
            foreground: "0 25% 15%",
            card: "0 70% 95%",
            cardForeground: "0 25% 15%",
            popover: "0 70% 95%",
            popoverForeground: "0 25% 15%",
            primary: "355 90% 60%",                 // Karma's hair red
            primaryForeground: "0 0% 100%",
            secondary: "0 30% 88%",
            secondaryForeground: "0 20% 20%",
            muted: "0 25% 85%",
            mutedForeground: "0 10% 35%",
            accent: "355 90% 65%",                  // golden spark (his intellect, mischief)/
            accentForeground: "0 0% 100%",
            destructive: "0 80% 55%",
            destructiveForeground: "0 0% 100%",
            border: "0 25% 85%",
            input: "0 25% 95%",
            ring: "355 90% 60%",
        }
    )
};
