type JsonLdType = 'Product' | 'LocalBusiness' | 'Organization' | 'WebSite' | 'BreadcrumbList';

type JsonLdProps = {
  type: JsonLdType;
  data: Record<string, unknown>;
};

export function JsonLd({ type, data }: JsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = 'EUR',
  availability = 'https://schema.org/InStock',
  brand = 'Toninho Caffè',
}: {
  name: string;
  description: string;
  image: string;
  price: string;
  currency?: string;
  availability?: string;
  brand?: string;
}) {
  return (
    <JsonLd
      type="Product"
      data={{
        name,
        description,
        image,
        brand: { '@type': 'Brand', name: brand },
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: currency,
          availability,
          seller: { '@type': 'Organization', name: brand },
        },
      }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLd
      type="LocalBusiness"
      data={{
        name: 'Toninho Caffè',
        description: 'Torrefazione artigianale e cantina vini. Caffè specialty di origine e vini selezionati dalla tradizione italiana.',
        image: '/images/hero-mono.png',
        url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://toninhocaffe.com',
        telephone: '+39069066529',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IT',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '',
          longitude: '',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '19:00',
        },
        priceRange: '$$',
        servesCuisine: ['Italian Coffee', 'Wine'],
        hasMenu: {
          '@type': 'Menu',
          hasMenuSection: [
            {
              '@type': 'MenuSection',
              name: 'Caffè',
              hasMenuItem: [
                { '@type': 'MenuItem', name: 'Blend Classico', offers: { '@type': 'Offer', price: '12.00', priceCurrency: 'EUR' } },
                { '@type': 'MenuItem', name: 'Mono Origins', offers: { '@type': 'Offer', price: '18.00', priceCurrency: 'EUR' } },
                { '@type': 'MenuItem', name: 'Reserva Especial', offers: { '@type': 'Offer', price: '24.00', priceCurrency: 'EUR' } },
              ],
            },
          ],
        },
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      type="Organization"
      data={{
        name: 'Toninho Caffè',
        url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://toninhocaffe.com',
        logo: '/placeholder-logo.png',
        sameAs: [],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['Italian', 'English'],
        },
      }}
    />
  );
}
