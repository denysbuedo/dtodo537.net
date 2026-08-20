'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '../../lib/api';

interface CurrentUser {
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  emailVerifiedAt: string | null;
}

interface CurrentUserResponse {
  user: CurrentUser;
}

export default function AccountPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [message, setMessage] = useState('Cargando...');

  useEffect(() => {
    void loadUser();
  }, []);

  async function loadUser() {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      credentials: 'include',
    });

    const result = (await response.json()) as Partial<CurrentUserResponse>;

    if (!response.ok) {
      setMessage('No hay una sesión activa.');
      return;
    }

    setUser(result.user ?? null);
    setMessage('');
  }

  async function logout() {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    setMessage('Sesión cerrada.');
  }

  return (
    <main className="auth-page">
      <section className="auth-form">
        <p className="eyebrow">Cuenta</p>
        <h1>Mi sesión</h1>
        {user ? (
          <>
            <p>
              {user.firstName} {user.lastName}
              <br />
              {user.email}
            </p>
            <p>Estado: {user.status}</p>
            <button type="button" onClick={() => void logout()}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <p className="form-message">{message}</p>
            <Link href="/login">Iniciar sesión</Link>
          </>
        )}
      </section>
    </main>
  );
}
