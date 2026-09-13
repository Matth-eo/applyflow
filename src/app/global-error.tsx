"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Arial, sans-serif", padding: "4rem", textAlign: "center" }}>
        <h1>Applyflow couldn’t load.</h1>
        <p>Please try again in a moment.</p>
        <button onClick={reset} style={{ padding: "0.75rem 1.5rem", cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
