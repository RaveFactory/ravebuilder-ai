"use client";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function GenerateButton({
  onClick,
  disabled,
  loading,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        cyber-btn relative w-full py-3.5 px-6 text-sm font-semibold tracking-wide uppercase
        flex items-center justify-center gap-2
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${loading ? "animate-pulse-neon" : ""}
      `}
    >
      {loading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Generating...</span>
        </>
      ) : (
        <>
          <span className="text-lg">⚡</span>
          <span>Generate Website</span>
        </>
      )}
    </button>
  );
}
