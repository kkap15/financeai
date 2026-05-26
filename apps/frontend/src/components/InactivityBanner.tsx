'use client'

interface InactivityBannerProps {
    onDismiss: () => void;
}

export default function InactivityBanner({onDismiss}: InactivityBannerProps) {
    return (
    <div className="fixed top-0 left-0 right-0 z-[99999] bg-yellow-400 text-yellow-900 px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-lg">⚠️</span>
        <p className="font-medium text-sm">
          You've been inactive for a while. You'll be logged out soon.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-sm font-semibold underline hover:no-underline"
      >
        Stay logged in
      </button>
    </div>
  )
}