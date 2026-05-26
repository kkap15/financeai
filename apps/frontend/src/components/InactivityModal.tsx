'use client'

import { useEffect, useState } from 'react'

interface InactivityModalProps {
  onStay: () => void
}

export default function InactivityModal({ onStay }: InactivityModalProps) {
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
        <p className="text-4xl mb-4">⏱️</p>
        <h2 className="text-xl font-bold mb-2">Still there?</h2>
        <p className="text-gray-500 mb-6">
          You'll be logged out in{' '}
          <span className="font-bold text-red-500">{countdown}</span>{' '}
          seconds due to inactivity.
        </p>
        <button
          onClick={onStay}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600"
        >
          Stay logged in
        </button>
      </div>
    </div>
  )
}