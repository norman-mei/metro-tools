export const overrideCanonicalLink = () => {
    if (typeof document === 'undefined') {
        return;
    }

    const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (link) {
        link.setAttribute('href', window.location.origin);
    }
};
