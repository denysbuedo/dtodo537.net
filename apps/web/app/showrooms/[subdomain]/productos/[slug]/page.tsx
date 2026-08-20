'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiBaseUrl } from '../../../../../lib/api';

interface ProductPayload {
  product: {
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    price: string | null;
    currency: string;
    priceMode: string;
    availabilityStatus: string;
    attributes: Array<{
      id: string;
      name: string;
      value: string;
    }>;
    images: Array<{
      id: string;
      altText: string | null;
      urls: {
        large: string;
        thumbnail: string;
      };
    }>;
  };
}

export default function PublicProductPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const routeParams = use(params);
  const [payload, setPayload] = useState<ProductPayload | null>(null);
  const [message, setMessage] = useState('Cargando producto...');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const response = await fetch(
      `${apiBaseUrl}/public/showrooms/${routeParams.subdomain}/products/${routeParams.slug}`,
    );

    if (!response.ok) {
      setMessage('Producto no disponible.');
      return;
    }

    setPayload((await response.json()) as ProductPayload);
    setMessage('');
  }

  if (!payload) {
    return (
      <main className="auth-page">
        <section className="auth-form">
          <p className="form-message">{message}</p>
          <Link href={`/showrooms/${routeParams.subdomain}`}>Volver</Link>
        </section>
      </main>
    );
  }

  const product = payload.product;

  return (
    <main className="product-page">
      <section className="product-detail">
        <Link href={`/showrooms/${routeParams.subdomain}`}>Volver</Link>
        {product.images[0] ? (
          <img alt={product.images[0].altText ?? product.name} src={product.images[0].urls.large} />
        ) : null}
        <div>
          <p className="eyebrow">{product.availabilityStatus}</p>
          <h1>{product.name}</h1>
          <p>{product.shortDescription ?? product.description}</p>
          <strong>
            {product.priceMode === 'CONTACT' ? 'Consultar precio' : `${product.price ?? '0'} ${product.currency}`}
          </strong>
          {product.attributes.length > 0 ? (
            <dl>
              {product.attributes.map((attribute) => (
                <div key={attribute.id}>
                  <dt>{attribute.name}</dt>
                  <dd>{attribute.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>
    </main>
  );
}
