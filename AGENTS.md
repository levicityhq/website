# Styling

Use Tailwind CSS for all application styling. Prefer utility classes in JSX;
use Tailwind directives such as `@apply` only for a reusable component pattern
that would otherwise repeat substantially. Do not add handwritten CSS rules,
CSS modules, or inline `style` props. Keep global CSS limited to Tailwind
imports and theme tokens.
