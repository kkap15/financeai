'use client'

import { useState } from 'react'

export default function TestApiButton() {
  const [result, setResult] = useState<string>('')

  async function testApi() {
    const res = await fetch('/api/user')
    const data = await res.json()
    setResult(JSON.stringify(data, null, 2))
  }

  return (
    <div className="mb-4">
      <button
        onClick={testApi}
        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
      >
        Test API
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
          {result}
        </pre>
      )}
    </div>
  )
}