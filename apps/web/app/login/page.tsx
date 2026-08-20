'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiBaseUrl } from '../../lib/api';

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string>('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    const result = (await response.json()) as ApiErrorResponse;

    if (!response.ok) {
      setMessage(result.error?.message ?? 'No se pudo iniciar sesión.');
      return;
    }

    router.push('/account');
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <p className="eyebrow">Identidad</p>
        <h1>Iniciar sesión</h1>
        <label>
          Correo
          <input name="email" required type="email" />
        </label>
        <label>
          Contraseña
          <input name="password" required type="password" />
        </label>
        <button type="submit">Entrar</button>
        {message ? <p className="form-message">{message}</p> : null}
        <Link href="/register">Crear cuenta</Link>
      </form>
    </main>
  );
}
