import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function BackendStatus() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function checkBackend() {
      try {
        const response = await fetch(`${API}/health`, { signal: controller.signal });
        setStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setStatus('offline');
        }
      }
    }

    checkBackend();

    return () => controller.abort();
  }, []);

  const isOnline = status === 'online';

  return (
    <div className="mt-6 mx-auto max-w-3xl rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-3 text-left text-white shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Backend connection</p>
          <p className="text-sm md:text-base font-semibold">
            {status === 'loading' && 'Checking connection to the API...'}
            {isOnline && 'Connected to the Render backend'}
            {status === 'offline' && 'Backend is unreachable'}
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            status === 'loading'
              ? 'bg-white/15 text-white'
              : isOnline
                ? 'bg-emerald-400/20 text-emerald-100'
                : 'bg-rose-400/20 text-rose-100'
          }`}
        >
          {status === 'loading' ? 'Checking' : isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}