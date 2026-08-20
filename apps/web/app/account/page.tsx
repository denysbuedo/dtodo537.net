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

interface TenantListResponse {
  tenants: Array<{
    tenant: {
      id: string;
      name: string;
      slug: string;
      status: string;
    };
    membership: {
      role: string;
      status: string;
    };
    businesses: Array<{
      id: string;
      name: string;
      status: string;
      businessType: {
        name: string;
      } | null;
    }>;
  }>;
}

export default function AccountPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [tenants, setTenants] = useState<TenantListResponse['tenants']>([]);
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
    await loadTenants();
    setMessage('');
  }

  async function loadTenants() {
    const response = await fetch(`${apiBaseUrl}/tenants`, {
      credentials: 'include',
    });

    if (!response.ok) {
      setTenants([]);
      return;
    }

    const result = (await response.json()) as TenantListResponse;
    setTenants(result.tenants);
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
            <div className="tenant-list">
              <div className="tenant-list-header">
                <h2>Tenants</h2>
                <Link href="/onboarding">Crear negocio</Link>
              </div>
              {tenants.length > 0 ? (
                tenants.map((item) => (
                  <article key={item.tenant.id} className="tenant-summary">
                    <p>
                      {item.tenant.name}
                      <br />
                      {item.tenant.slug}
                    </p>
                    <p>
                      Rol: {item.membership.role}
                      <br />
                      Estado: {item.tenant.status}
                    </p>
                    {item.businesses.map((business) => (
                      <p key={business.id}>
                        {business.name}
                        <br />
                        Business: {business.status}
                      </p>
                    ))}
                  </article>
                ))
              ) : (
                <p className="form-message">Aún no tienes tenants.</p>
              )}
            </div>
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
