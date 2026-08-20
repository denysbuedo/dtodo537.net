'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '../../lib/api';

interface ProvisionResponse {
  tenant: {
    name: string;
    slug: string;
    status: string;
  };
  business: {
    name: string;
    status: string;
    businessType: {
      name: string;
    } | null;
  };
  showroom: {
    subdomain: string;
    status: string;
  };
}

export default function OnboardingPage() {
  const [result, setResult] = useState<ProvisionResponse | null>(null);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Creando tenant...');
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${apiBaseUrl}/tenants/provision`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: formData.get('businessName'),
        businessTypeCode: formData.get('businessTypeCode'),
        subdomain: formData.get('subdomain'),
      }),
    });

    const payload = (await response.json()) as ProvisionResponse | { error?: { message: string } };

    if (!response.ok) {
      setMessage('error' in payload && payload.error ? payload.error.message : 'No se pudo crear.');
      return;
    }

    setResult(payload as ProvisionResponse);
    setMessage('Tenant creado.');
  }

  return (
    <main className="auth-page">
      <section className="auth-form">
        <p className="eyebrow">Onboarding</p>
        <h1>Crear negocio</h1>
        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Nombre del negocio
            <input name="businessName" required minLength={2} placeholder="Muebles Habana" />
          </label>
          <label>
            Tipo
            <select name="businessTypeCode" defaultValue="retail">
              <option value="retail">Comercio minorista</option>
              <option value="services">Servicios</option>
              <option value="general">General</option>
            </select>
          </label>
          <label>
            Subdominio
            <input name="subdomain" required minLength={3} placeholder="muebles-habana" />
          </label>
          <button type="submit">Crear</button>
        </form>
        {message ? <p className="form-message">{message}</p> : null}
        {result ? (
          <div className="tenant-summary">
            <p>
              {result.tenant.name}
              <br />
              Tenant: {result.tenant.status}
            </p>
            <p>
              {result.business.name}
              <br />
              Business: {result.business.status}
            </p>
            <p>
              Subdominio: {result.showroom.subdomain}
              <br />
              Showroom: {result.showroom.status}
            </p>
            <Link href="/account">Ver cuenta</Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
