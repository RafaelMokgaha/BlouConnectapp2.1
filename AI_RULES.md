# AI Development Rules for BlouConnect

This document outlines the technical stack and development rules for this project. Adhering to these guidelines is crucial for maintaining code quality, consistency, and simplicity.

## Tech Stack

The application is built with a modern, lightweight tech stack:

-   **Framework**: React with TypeScript for building a type-safe and robust user interface.
-   **Build Tool**: Vite provides a fast development server and optimized production builds.
-   **Styling**: Tailwind CSS is used exclusively for utility-first styling. All components are styled using Tailwind classes.
-   **UI Components**: The app uses custom-built components, following the principles of shadcn/ui for structure and composability.
-   **Icons**: `lucide-react` is the sole library for icons to ensure visual consistency.
-   **State Management**: Global application state is managed via React's built-in Context API, specifically within `AppContext.tsx`.
-   **Routing**: A simple, custom tab-based navigation system is managed within `App.tsx`.
-   **Data Persistence**: `localStorage` is used for persisting the user session and theme settings.
-   **Data Visualization**: `recharts` is available for any charting or data visualization requirements.

## Library Usage Rules

To keep the codebase clean and predictable, please follow these library usage rules:

-   **Styling**: **ALWAYS** use Tailwind CSS classes for styling. Do not write custom CSS files or use inline `style` objects unless it's for a dynamic property that cannot be handled by Tailwind.
-   **Components**: Prioritize creating small, single-purpose, reusable components in the `src/components/` directory. Do not add complex business logic directly into UI components; abstract it into hooks or the central `AppContext`.
-   **Icons**: **ONLY** use icons from the `lucide-react` library. Do not add SVGs directly to the codebase or install other icon libraries.
-   **State Management**: For global state, use the existing `AppContext`. For component-level state, use the `useState` and `useEffect` hooks. Do not introduce other state management libraries like Redux or Zustand.
-   **Routing**: Continue using the existing custom routing logic in `App.tsx`. Do not install or use `react-router-dom` or any other routing library.
-   **Forms**: Manage form state with the `useState` hook. Do not add complex form management libraries like Formik or React Hook Form.
-   **Charts**: If you need to display charts or graphs, use the pre-installed `recharts` library.