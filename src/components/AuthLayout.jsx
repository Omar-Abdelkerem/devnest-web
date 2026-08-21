/**
 * AuthLayout.jsx
 *
 * A reusable wrapper for authentication pages (Sign In, Register).
 * Centers the form card horizontally and provides appropriate vertical spacing,
 * ensuring a consistent max-width and structural aesthetic.
 */

export default function AuthLayout({ children }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 min-h-full">
      <div className="w-full max-w-[440px]">
        {children}
      </div>
    </div>
  )
}
