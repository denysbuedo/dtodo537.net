'use client';

import type { FormEvent } from 'react';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '../../../../../lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: string | null;
  currency: string;
  priceMode: string;
  availabilityStatus: string;
  publicationStatus: string;
  featured: boolean;
  images: Array<{
    id: string;
    status: string;
    urls: {
      card: string;
      thumbnail: string;
    };
  }>;
}

interface CatalogState {
  business: {
    id: string;
    name: string;
  };
  categories: Category[];
  products: Product[];
}

export default function CatalogManagePage({ params }: { params: Promise<{ businessId: string }> }) {
  const routeParams = use(params);
  const [catalog, setCatalog] = useState<CatalogState | null>(null);
  const [message, setMessage] = useState('Cargando catálogo...');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const response = await fetch(`${apiBaseUrl}/businesses/${routeParams.businessId}/catalog`, {
      credentials: 'include',
    });

    if (!response.ok) {
      setMessage('No se pudo cargar el catálogo.');
      return;
    }

    setCatalog((await response.json()) as CatalogState);
    setMessage('');
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Guardando categoría...');
    const payload = toJsonPayload(new FormData(event.currentTarget));
    const response = await fetch(`${apiBaseUrl}/businesses/${routeParams.businessId}/categories`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    await handleMutation(response, 'Categoría creada.');
    event.currentTarget.reset();
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Guardando producto...');
    const payload = normalizeProductPayload(toJsonPayload(new FormData(event.currentTarget)));
    const response = await fetch(`${apiBaseUrl}/businesses/${routeParams.businessId}/products`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    await handleMutation(response, 'Producto creado.');
    event.currentTarget.reset();
  }

  async function quickUpdate(productId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Actualizando producto...');
    const payload = normalizeProductPayload(toJsonPayload(new FormData(event.currentTarget)));
    const response = await fetch(`${apiBaseUrl}/products/${productId}/quick`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    await handleMutation(response, 'Producto actualizado.');
  }

  async function publish(productId: string, publishProduct: boolean) {
    setMessage(publishProduct ? 'Publicando producto...' : 'Despublicando producto...');
    const response = await fetch(`${apiBaseUrl}/products/${productId}/publication`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish: publishProduct }),
    });

    await handleMutation(response, publishProduct ? 'Producto publicado.' : 'Producto despublicado.');
  }

  async function uploadImage(productId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Subiendo imagen...');
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${apiBaseUrl}/products/${productId}/images/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    await handleMutation(response, 'Imagen subida. El worker procesará las variantes.');
    event.currentTarget.reset();
  }

  async function handleMutation(response: Response, successMessage: string) {
    const result = (await response.json()) as { error?: { message: string } };

    if (!response.ok) {
      setMessage(result.error?.message ?? 'No se pudo completar la acción.');
      return;
    }

    await load();
    setMessage(successMessage);
  }

  if (!catalog) {
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
    <main className="settings-page catalog-page">
      <section className="settings-shell">
        <div className="settings-header">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h1>{catalog.business.name}</h1>
            <p>{message || `${catalog.products.length} productos`}</p>
          </div>
          <Link href="/account">Cuenta</Link>
        </div>

        <form className="settings-panel" onSubmit={(event) => void createCategory(event)}>
          <h2>Categoría</h2>
          <label>
            Nombre
            <input name="name" required minLength={2} />
          </label>
          <label>
            Descripción
            <input name="description" />
          </label>
          <button type="submit">Crear categoría</button>
        </form>

        <form className="settings-panel" onSubmit={(event) => void createProduct(event)}>
          <h2>Producto</h2>
          <label>
            Nombre
            <input name="name" required minLength={2} />
          </label>
          <label>
            Categoría
            <select name="categoryId">
              <option value="">Sin categoría</option>
              {catalog.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Resumen
            <input name="shortDescription" />
          </label>
          <label>
            Precio
            <input name="price" inputMode="decimal" type="number" min="0" step="0.01" />
          </label>
          <label>
            Modalidad
            <select name="priceMode" defaultValue="CONTACT">
              <option value="CONTACT">Consultar</option>
              <option value="FIXED">Fijo</option>
              <option value="FROM">Desde</option>
              <option value="FREE">Gratis</option>
            </select>
          </label>
          <button type="submit">Crear producto</button>
        </form>

        <section className="catalog-list">
          {catalog.products.map((product) => (
            <article key={product.id} className="catalog-item">
              {product.images[0] ? (
                <img alt="" src={product.images[0].urls.thumbnail} />
              ) : (
                <div className="catalog-image-placeholder">Sin imagen</div>
              )}
              <div>
                <h2>{product.name}</h2>
                <p>
                  {product.publicationStatus} · {product.availabilityStatus}
                </p>
                <p>
                  {product.priceMode === 'CONTACT'
                    ? 'Consultar precio'
                    : `${product.price ?? '0'} ${product.currency}`}
                </p>
                <form className="quick-form" onSubmit={(event) => void quickUpdate(product.id, event)}>
                  <input name="price" inputMode="decimal" type="number" min="0" step="0.01" placeholder="Precio" />
                  <select name="priceMode" defaultValue={product.priceMode}>
                    <option value="CONTACT">Consultar</option>
                    <option value="FIXED">Fijo</option>
                    <option value="FROM">Desde</option>
                    <option value="FREE">Gratis</option>
                  </select>
                  <select name="availabilityStatus" defaultValue={product.availabilityStatus}>
                    <option value="AVAILABLE">Disponible</option>
                    <option value="OUT_OF_STOCK">Agotado</option>
                    <option value="ON_REQUEST">Por encargo</option>
                    <option value="COMING_SOON">Próximamente</option>
                    <option value="UNAVAILABLE">No disponible</option>
                  </select>
                  <button type="submit">Actualizar</button>
                </form>
                <form className="quick-form" onSubmit={(event) => void uploadImage(product.id, event)}>
                  <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
                  <button type="submit">Subir imagen</button>
                </form>
                <div className="settings-actions">
                  <button type="button" onClick={() => void publish(product.id, true)}>
                    Publicar
                  </button>
                  <button type="button" onClick={() => void publish(product.id, false)}>
                    Despublicar
                  </button>
                </div>
              </div>
            </article>
          ))}
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

function normalizeProductPayload(payload: Record<string, FormDataEntryValue>) {
  return {
    ...payload,
    price: typeof payload.price === 'string' && payload.price !== '' ? Number(payload.price) : undefined,
  };
}
