import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultMeta = {
  siteName: 'ShoeShop',
  title: 'ShoeShop - Votre boutique de chaussures en ligne',
  description: 'Découvrez notre collection de chaussures de grandes marques: Nike, Adidas, Converse, Vans et plus. Livraison rapide et paiement sécurisé.',
  keywords: 'chaussures, sneakers, Nike, Adidas, Converse, Vans, New Balance, boutique en ligne, mode',
  image: '/og-image.jpg',
  url: 'https://shoeshop.com',
};

const SEO: React.FC<SEOProps> = ({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = 'website',
}) => {
  const fullTitle = title
    ? `${title} | ${defaultMeta.siteName}`
    : defaultMeta.title;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="ShoeShop" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={defaultMeta.siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <html lang="fr" />
    </Helmet>
  );
};

export default SEO;
