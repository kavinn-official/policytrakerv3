import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * SEOHead component for managing page-level SEO meta tags
 * Sets canonical URL, title, description, and Open Graph tags
 */
const SEOHead = ({
  title,
  description,
  canonicalPath,
  keywords,
  ogTitle,
  ogDescription,
  ogImage = 'https://policytracker.in/og-image.png',
  noIndex = false,
}: SEOHeadProps) => {
  const location = useLocation();
  const baseUrl = 'https://policytracker.in';
  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = canonicalUrl;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = canonicalUrl;
      document.head.appendChild(canonicalLink);
    }

    // Update keywords if provided
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        metaKeywords.setAttribute('content', keywords);
        document.head.appendChild(metaKeywords);
      }
    }

    // Update robots meta
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    }

    // Update Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', content);
      } else {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        ogTag.setAttribute('content', content);
        document.head.appendChild(ogTag);
      }
    };

    updateOGTag('og:title', ogTitle || title);
    updateOGTag('og:description', ogDescription || description);
    updateOGTag('og:url', canonicalUrl);
    updateOGTag('og:image', ogImage);

    // Update Twitter tags
    const updateTwitterTag = (name: string, content: string) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (twitterTag) {
        twitterTag.setAttribute('content', content);
      } else {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', name);
        twitterTag.setAttribute('content', content);
        document.head.appendChild(twitterTag);
      }
    };

    updateTwitterTag('twitter:title', ogTitle || title);
    updateTwitterTag('twitter:description', ogDescription || description);
    updateTwitterTag('twitter:image', ogImage);

    // Cleanup function not needed as we're modifying existing tags
  }, [title, description, canonicalUrl, keywords, ogTitle, ogDescription, ogImage, noIndex]);

  return null; // This component doesn't render anything
};

export default SEOHead;
