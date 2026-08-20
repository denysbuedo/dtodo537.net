'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '../../../../lib/api';
import { ShowroomView, type ShowroomPayload } from '../../../../lib/showroom-view';

export default function ShowroomPreviewPage({ params }: { params: Promise<{ showroomId: string }> }) {
  const routeParams = use(params);
  const [payload, setPayload] = useState<ShowroomPayload | null>(null);
  const [message, setMessage] = useState('Cargando preview...');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const response = await fetch(`${apiBaseUrl}/showrooms/${routeParams.showroomId}/preview`, {
      credentials: 'include',
    });

    if (!response.ok) {
      setMessage('No se pudo cargar el preview.');
      return;
    }

    setPayload((await response.json()) as ShowroomPayload);
    setMessage('');
  }

  if (!payload) {
    return (
      <main className="auth-page">
        <section className="auth-form">
          <p className="form-message">{message}</p>
          <Link href="/account">Volver</Link>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="preview-bar">
        Preview no indexable
        <Link href={`/manage/showrooms/${payload.showroom.id}`}>Editar</Link>
      </div>
      <ShowroomView payload={payload} />
    </>
  );
}
