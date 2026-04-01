# Brand Guidelines & Design Tokens

The AI-ME Template Dashboard is primarily powered by Tailwind CSS v3 and `shadcn/ui` custom UI primitives. The foundation of styling focuses on **CSS variables mapping to HSL values** to ensure flexible and fast theme switching.

## The Company Brand Palette

The default preset for this boilerplate relies on the **Company Blue (`#027DC7`)**.

Instead of hardcoding standard hex codes inside UI elements like `bg-[#027DC7]`, always use the semantic Tailwind tracking names.

### Scale Overview

_Added to `theme.extend.colors` inside `tailwind.config.ts`._

| Token           | Hex           | Target Usage                                    |
| :-------------- | :------------ | :---------------------------------------------- |
| `brand-50`      | `#e8f5fc`     | Page tints, secondary sidebar hovers            |
| `brand-100`     | `#c5e7f7`     | Selected row backgrounds, soft badges           |
| `brand-300`     | `#76c4ea`     | Charts, decorative graphical elements           |
| **`brand-500`** | **`#027DC7`** | **Primary Baseline** (Same as `var(--primary)`) |
| `brand-600`     | `#0269ad`     | Button hover states                             |
| `brand-700`     | `#015592`     | Button active states, emphasis text             |
| `brand-900`     | `#012f4f`     | High-contrast application text                  |

## Semantic Colors

Colors indicating status must be consistent app-wide. They are generally mapped to `shadcn` root variables in `globals.css`:

| Role            | Hex Goal  | Typical HSL Variable       | Usage                              |
| :-------------- | :-------- | :------------------------- | :--------------------------------- |
| **Success**     | `#059669` | `--success: 160 84% 39%`   | Completed states, healthy metrics. |
| **Warning**     | `#d97706` | `--warning: 32 95% 44%`    | Pending items, rate constraints.   |
| **Destructive** | `#dc2626` | `--destructive: 0 84% 60%` | Errors, deletion targets, blocked. |

## Application Custom Properties

All standard component borders, cards, foreground/backgrounds, and radii are powered by `--radius`, `--card`, `--foreground`, etc., stored inside `globals.css`.

**Implementation mandates:**

- _Never scatter raw CSS hex codes._
- Ensure `--destructive` values match the semantic colors mentioned above.

## Brand Presets

A product can ship with multiple configurations. This is achieved by flipping the `data-brand` attribute directly on the `<html>` node.

- `data-brand="company"`: The default template blue.
- `data-brand="neutral"`: Removes the primary brand scale in favor of a gray/slate dominant UI.

## Typography

- **Headers:** By default `text-xl md:text-2xl`. Handled natively using `<PageHeader size="md" />` component constraints.
- **Body:** Follows the system font stack.
- To inject custom fonts, declare them globally inside `@font-face` within `globals.css`.

## Spacing

- All main page padding must utilize the standardized responsive mapping layout inside `<PageContainer>` which applies `px-4 md:px-6 lg:px-8` so that page margins align flawlessly app-wide.
