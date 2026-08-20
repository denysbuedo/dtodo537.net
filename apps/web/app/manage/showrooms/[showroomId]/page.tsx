'use client';

import type { FormEvent } from 'react';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '../../../../lib/api';

interface ShowroomState {
  id: string;
  subdomain: string;
  status: string;
  publishedAt: string | null;
  theme: {
    code: string;
    name: string;
  } | null;
  themeConfiguration: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  } | null;
  business: {
    name: string;
    description: string | null;
    shortDescription: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    timezone: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
  };
  socialProfiles: Array<{
    type: string;
    url: string;
  }>;
  whatsapp: {
    phoneNumber: string;
    defaultMessage: string | null;
    enabled: boolean;
  } | null;
}

interface ThemeOption {
  code: string;
  name: string;
  description: string | null;
}

export default function ShowroomManagePage({ params }: { params: Promise<{ showroomId: string }> }) {
  const routeParams = use(params);
  const [showroom, setShowroom] = useState<ShowroomState | null>(null);
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [message, setMessage] = useState('Cargando...');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const [showroomResponse, themesResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/showrooms/${routeParams.showroomId}/manage`, { credentials: 'include' }),
      fetch(`${apiBaseUrl}/themes`, { credentials: 'include' }),
    ]);

    if (!showroomResponse.ok) {
      setMessage('No se pudo cargar el showroom.');
      return;
    }

    const showroomPayload = (await showroomResponse.json()) as ShowroomState;
    const themesPayload = (await themesResponse.json()) as { themes: ThemeOption[] };
    setShowroom(showroomPayload);
    setThemes(themesPayload.themes ?? []);
    setMessage('');
  }

  async function submitForm(event: FormEvent<HTMLFormElement>, path: string) {
    event.preventDefault();
    setMessage('Guardando...');
    const formData = new FormData(event.currentTarget);
    const payload = toJsonPayload(formData);

    const response = await fetch(`${apiBaseUrl}/showrooms/${routeParams.showroomId}/${path}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as ShowroomState | { error?: { message: string } };

    if (!response.ok) {
      setMessage('error' in result && result.error ? result.error.message : 'No se pudo guardar.');
      return;
    }

    if (!isShowroomState(result)) {
      setMessage('La respuesta del servidor no tiene el formato esperado.');
      return;
    }

    setShowroom(result);
    setMessage('Cambios guardados.');
  }

  async function setPublication(publish: boolean) {
    setMessage(publish ? 'Publicando...' : 'Despublicando...');
    const response = await fetch(`${apiBaseUrl}/showrooms/${routeParams.showroomId}/publication`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish }),
    });

    const result = (await response.json()) as ShowroomState | { error?: { message: string } };

    if (!response.ok) {
      setMessage('error' in result && result.error ? result.error.message : 'No se pudo publicar.');
      return;
    }

    if (!isShowroomState(result)) {
      setMessage('La respuesta del servidor no tiene el formato esperado.');
      return;
    }

    setShowroom(result);
    setMessage(publish ? 'Showroom publicado.' : 'Showroom en borrador.');
  }

  if (!showroom) {
    return (
      <main className="auth-page">
        <section className="auth-form">
          <p className="form-message">{message}</p>
          <Link href="/account">Volver</Link>
        </section>
      </main>
    );
  }

  const instagram = showroom.socialProfiles.find((profile) => profile.type === 'INSTAGRAM')?.url;
  const facebook = showroom.socialProfiles.find((profile) => profile.type === 'FACEBOOK')?.url;
  const website = showroom.socialProfiles.find((profile) => profile.type === 'WEBSITE')?.url;

  return (
    <main className="settings-page">
      <section className="settings-shell">
        <div className="settings-header">
          <div>
            <p className="eyebrow">Showroom</p>
            <h1>{showroom.business.name}</h1>
            <p>Estado: {showroom.status}</p>
          </div>
          <div className="settings-actions">
            <Link href={`/preview/showrooms/${showroom.id}`}>Preview</Link>
            <Link href={`/showrooms/${showroom.subdomain}`}>Público</Link>
          </div>
        </div>

        <form className="settings-panel" onSubmit={(event) => void submitForm(event, 'profile')}>
          <h2>Perfil</h2>
          <label>
            Nombre
            <input name="name" defaultValue={showroom.business.name} />
          </label>
          <label>
            Descripción corta
            <input name="shortDescription" defaultValue={showroom.business.shortDescription ?? ''} />
          </label>
          <label>
            Descripción
            <textarea name="description" defaultValue={showroom.business.description ?? ''} />
          </label>
          <label>
            Dirección
            <input name="address" defaultValue={showroom.business.address ?? ''} />
          </label>
          <label>
            Timezone
            <input name="timezone" defaultValue={showroom.business.timezone ?? 'America/Havana'} />
          </label>
          <label>
            Logo URL
            <input name="logoUrl" type="url" defaultValue={showroom.business.logoUrl ?? ''} />
          </label>
          <label>
            Portada URL
            <input name="coverImageUrl" type="url" defaultValue={showroom.business.coverImageUrl ?? ''} />
          </label>
          <button type="submit">Guardar perfil</button>
        </form>

        <form className="settings-panel" onSubmit={(event) => void submitForm(event, 'contact')}>
          <h2>Contacto</h2>
          <label>
            Teléfono
            <input name="phone" defaultValue={showroom.business.phone ?? ''} />
          </label>
          <label>
            Correo
            <input name="email" type="email" defaultValue={showroom.business.email ?? ''} />
          </label>
          <label>
            WhatsApp
            <input name="whatsappPhone" defaultValue={showroom.whatsapp?.phoneNumber ?? ''} />
          </label>
          <label>
            Mensaje de WhatsApp
            <input name="whatsappMessage" defaultValue={showroom.whatsapp?.defaultMessage ?? ''} />
          </label>
          <label>
            Instagram opcional
            <input name="instagramUrl" type="url" placeholder="https://instagram.com/tu-negocio" defaultValue={instagram ?? ''} />
          </label>
          <label>
            Facebook opcional
            <input name="facebookUrl" type="url" placeholder="https://facebook.com/tu-negocio" defaultValue={facebook ?? ''} />
          </label>
          <label>
            Web opcional
            <input name="websiteUrl" type="url" placeholder="https://tudominio.com" defaultValue={website ?? ''} />
          </label>
          <button type="submit">Guardar contacto</button>
        </form>

        <form className="settings-panel" onSubmit={(event) => void submitForm(event, 'theme')}>
          <h2>Plantilla</h2>
          <label>
            Theme
            <select name="themeCode" defaultValue={showroom.theme?.code ?? 'minimal'}>
              {themes.map((theme) => (
                <option key={theme.code} value={theme.code}>
                  {theme.name}
                </option>
              ))}
            </select>
          </label>
          <div className="color-grid">
            <label>
              Primario
              <input
                name="primaryColor"
                type="color"
                defaultValue={showroom.themeConfiguration?.primaryColor ?? '#0f766e'}
              />
            </label>
            <label>
              Secundario
              <input
                name="secondaryColor"
                type="color"
                defaultValue={showroom.themeConfiguration?.secondaryColor ?? '#1d1d1b'}
              />
            </label>
            <label>
              Acento
              <input
                name="accentColor"
                type="color"
                defaultValue={showroom.themeConfiguration?.accentColor ?? '#f59e0b'}
              />
            </label>
          </div>
          <input name="fontFamily" type="hidden" value={showroom.themeConfiguration?.fontFamily ?? 'Inter'} />
          <button type="submit">Aplicar theme</button>
        </form>

        <section className="settings-panel">
          <h2>Publicación</h2>
          <p className="form-message">{message || 'Configura perfil, contacto y theme antes de publicar.'}</p>
          <div className="settings-actions">
            <button type="button" onClick={() => void setPublication(true)}>
              Publicar
            </button>
            <button type="button" onClick={() => void setPublication(false)}>
              Despublicar
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

function toJsonPayload(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries())
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value] as const)
      .filter(([, value]) => value !== ''),
  );
}

function isShowroomState(value: ShowroomState | { error?: { message: string } }): value is ShowroomState {
  return 'id' in value && typeof value.id === 'string' && 'business' in value && value.business !== null;
}
