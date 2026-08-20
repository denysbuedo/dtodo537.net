import type { CSSProperties } from 'react';

export interface ShowroomPayload {
  indexable: boolean;
  showroom: {
    id: string;
    subdomain: string;
    status: string;
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
  };
}

export function ShowroomView({ payload }: { payload: ShowroomPayload }) {
  const showroom = payload.showroom;
  const business = showroom.business;
  const tokens = showroom.themeConfiguration;
  const style = {
    '--showroom-primary': tokens?.primaryColor ?? '#0f766e',
    '--showroom-secondary': tokens?.secondaryColor ?? '#1d1d1b',
    '--showroom-accent': tokens?.accentColor ?? '#f59e0b',
    '--showroom-font': tokens?.fontFamily ?? 'Inter',
  } as CSSProperties;
  const whatsappHref =
    showroom.whatsapp?.enabled && showroom.whatsapp.phoneNumber
      ? `https://wa.me/${showroom.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          showroom.whatsapp.defaultMessage ?? `Hola, me interesa ${business.name}.`,
        )}`
      : null;

  return (
    <main className={`showroom-page theme-${showroom.theme?.code ?? 'minimal'}`} style={style}>
      <section className="showroom-hero">
        {business.coverImageUrl ? (
          <img alt="" className="showroom-cover" src={business.coverImageUrl} />
        ) : null}
        <div className="showroom-hero-content">
          {business.logoUrl ? (
            <img alt={`${business.name} logo`} className="showroom-logo" src={business.logoUrl} />
          ) : null}
          <p className="eyebrow">{showroom.subdomain}.dtodo537.net</p>
          <h1>{business.name}</h1>
          <p>{business.shortDescription ?? business.description ?? 'Showroom comercial.'}</p>
          <div className="showroom-actions">
            {whatsappHref ? <a href={whatsappHref}>WhatsApp</a> : null}
            {business.phone ? <a href={`tel:${business.phone}`}>Llamar</a> : null}
            {business.email ? <a href={`mailto:${business.email}`}>Correo</a> : null}
          </div>
        </div>
      </section>

      <section className="showroom-section">
        <h2>Negocio</h2>
        <p>{business.description ?? 'Este negocio aún está completando su presentación.'}</p>
        {business.address ? <p>Dirección: {business.address}</p> : null}
      </section>

      <section className="showroom-section">
        <h2>Catálogo</h2>
        <p>El catálogo se habilitará en el siguiente hito.</p>
      </section>

      {showroom.socialProfiles.length > 0 ? (
        <section className="showroom-section">
          <h2>Redes</h2>
          <div className="showroom-actions">
            {showroom.socialProfiles.map((profile) => (
              <a key={`${profile.type}-${profile.url}`} href={profile.url}>
                {profile.type}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
