import { Button } from '@dtodo/ui';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="home">
      <section>
        <p className="eyebrow">Foundation tecnica</p>
        <h1>dtodo537.net</h1>
        <p>
          Base inicial para construir la plataforma de showrooms comerciales sin adelantar modulos
          funcionales.
        </p>
        <div className="home-actions">
          <Link href="/register">Crear cuenta</Link>
          <Link href="/login">Iniciar sesión</Link>
          <Button aria-label="Estado de la base tecnica">M1 en desarrollo</Button>
        </div>
      </section>
    </main>
  );
}
