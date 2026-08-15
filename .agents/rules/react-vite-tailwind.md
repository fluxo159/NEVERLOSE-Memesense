---
trigger: always_on
description: "Strict coding guidelines for React, TypeScript, Vite, and Tailwind CSS."
---

# React + TypeScript + Tailwind Best Practices

You must follow these strict guidelines whenever you write or modify code in this project.

## 1. General Principles
- Write concise, readable, and maintainable code.
- Prefer functional programming paradigms (immutability, pure functions) where appropriate.
- Avoid premature optimization, but write performant code by default.

## 2. React & Components
- Use Functional Components exclusively. Do not use Class components.
- Use hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) correctly, avoiding unnecessary re-renders.
- Keep components small and focused on a single responsibility.
- Extract reusable logic into custom hooks.
- Prefix boolean variables with `is`, `has`, `can`, or `should` (e.g., `isOpen`, `hasData`).

## 3. TypeScript
- STRICT TYPING: Avoid `any` at all costs. Use `unknown` if the type is truly not known.
- Define explicit `interface` or `type` for component props.
- Use proper Return Types for functions where it adds clarity.
- Prefer union types over enums.

## 4. Tailwind CSS
- Use utility classes directly in the `className` prop.
- Group related classes logically (layout -> spacing -> typography -> colors).
- Use `clsx` and `tailwind-merge` (or `twMerge`) when dynamically concatenating classes to avoid specificity conflicts.
- Do not write custom CSS in `index.css` unless absolutely necessary (e.g., base font resets or custom complex animations). Use Tailwind utilities.

## 5. File Structure and Naming
- Use PascalCase for React component files (e.g., `DashboardView.tsx`).
- Use camelCase for utility files and hooks (e.g., `useFetch.ts`, `formatters.ts`).
- Export components as `default` only for page-level views or lazy-loaded modules. Otherwise, prefer named exports.

## 6. Error Handling
- Fail gracefully. Do not let exceptions crash the entire React tree.
- Use standard `try/catch` blocks inside async functions.

Follow these rules blindly on every task.
