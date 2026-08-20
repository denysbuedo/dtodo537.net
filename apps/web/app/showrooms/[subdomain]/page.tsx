'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '../../../lib/api';
import { ShowroomView, type ShowroomPayload } from '../../../lib/showroom-view';

export default function PublicShowroomPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const routeParams = use(params);
  const [payload, setPayload] = useState<ShowroomPayload | null>(null);
  const [message, setMessage] = useState('Cargando showroom...');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const [response, catalogResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/public/showrooms/${routeParams.subdomain}`),
      fetch(`${apiBaseUrl}/public/showrooms/${routeParams.subdomain}/products`),
    ]);

    if (!response.ok) {
      setMessage('Showroom no disponible.');
      return;
    }

    const showroomPayload = (await response.json()) as ShowroomPayload;
    const catalogPayload = catalogResponse.ok
      ? ((await catalogResponse.json()) as { products: NonNullable<ShowroomPayload['showroom']['products']> })
      : { products: [] };
    setPayload({
      ...showroomPayload,
      showroom: {
        ...showroomPayload.showroom,
        products: catalogPayload.products,
      },
    });
    setMessage('');
  }

  if (!payload) {
    return (
      <main className="auth-page">
        <section className="auth-form">
          <p className="form-message">{message}</p>
          <Link href="/">Inicio</Link>
        </section>
      </main>
    );
  }

  return <ShowroomView payload={payload} />;
}
