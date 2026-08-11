import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const siteUrl = 'https://playhubb.site';
const landingTitle = 'PlayHub | Multiplayer Browser Games';
const landingDescription = 'Play multiplayer browser games on PlayHub.';

function RouteMetadata() {
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!robots || !description || !canonical) {
      return;
    }

    document.title = isLandingPage ? landingTitle : 'PlayHub';
    robots.content = isLandingPage ? 'index,follow' : 'noindex,nofollow';
    description.content = landingDescription;
    canonical.href = isLandingPage ? `${siteUrl}/` : `${siteUrl}${pathname}`;
  }, [isLandingPage, pathname]);

  return null;
}

export default RouteMetadata;
