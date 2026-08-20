'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '../../lib/api';

interface RegisterResponse {
  devToken?: string;
  error?: {
    message?: string;
  };
}

export default function RegisterPage() {
  const [message, setMessage] = useState<string>('');
  const [devToken, setDevToken] = useState<string>('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch(`${apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    const result = (await response.json()) as RegisterResponse;

    if (!response.ok) {
      setMessage(result.error?.message ?? 'No se pudo crear la cuenta.');
      setDevToken('');
      return;
    }

    setMessage('Cuenta creada. Ya puedes iniciar sesión.');
    setDevToken(result.devToken ?? '');
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
        <p className="eyebrow">Identidad</p>
        <h1>Crear cuenta</h1>
        <label>
          Nombre
          <input name="firstName" required />
        </label>
        <label>
          Apellidos
          <input name="lastName" required />
        </label>
        <label>
          Correo
          <input name="email" required type="email" />
        </label>
        <label>
          Contraseña
          <input name="password" required minLength={12} type="password" />
        </label>
        <button type="submit">Crear cuenta</button>
        {message ? <p className="form-message">{message}</p> : null}
        {devToken ? <p className="dev-token">Token dev: {devToken}</p> : null}
        <Link href="/login">Ya tengo cuenta</Link>
      </form>
    </main>
  );
}
