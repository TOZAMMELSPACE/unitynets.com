import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  structuredData?: object;
}

/**
 * SEO component for dynamic page-level meta tags
 * Updates document head with page-specific SEO elements
 */
export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://unitynets.com/og-image.png',
  ogType = 'website',
  noIndex = false,
  structuredData,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = `${title} | UnityNets`;
    }

    // Helper to update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update description
    if (description) {
      updateMeta('description', description);
      updateMeta('og:description', description, true);
      updateMeta('twitter:description', description);
    }

    // Update keywords
    if (keywords) {
      updateMeta('keywords', keywords);
    }

    // Update OG tags
    if (title) {
      updateMeta('og:title', `${title} | UnityNets`, true);
      updateMeta('twitter:title', `${title} | UnityNets`);
    }

    updateMeta('og:image', ogImage, true);
    updateMeta('twitter:image', ogImage);
    updateMeta('og:type', ogType, true);

    // Update canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);

      updateMeta('og:url', canonicalUrl, true);
      updateMeta('twitter:url', canonicalUrl);
    }

    // Handle noIndex
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    }

    // Add structured data
    if (structuredData) {
      const existingScript = document.querySelector('script[data-seo-structured]');
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-structured', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup on unmount - restore defaults
    return () => {
      document.title = 'UnityNets - Trust • Learn • Unite | একত্রে শক্তিশালী';
      
      const structuredScript = document.querySelector('script[data-seo-structured]');
      if (structuredScript) {
        structuredScript.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex, structuredData]);

  return null;
};

export default SEOHead;
