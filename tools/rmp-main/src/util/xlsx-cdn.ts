const XLSX_CDN_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

let xlsxLoaderPromise: Promise<any> | undefined;

/**
 * Load SheetJS (XLSX) at runtime from CDN.
 * This keeps build-time dependencies unchanged when npm registry is unavailable.
 */
export const loadXlsx = async (): Promise<any> => {
    if (typeof window === 'undefined') {
        throw new Error('XLSX loader can only run in browser context.');
    }

    if (window.XLSX) {
        return window.XLSX;
    }

    if (!xlsxLoaderPromise) {
        xlsxLoaderPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${XLSX_CDN_URL}"]`) as HTMLScriptElement | null;
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.XLSX));
                existingScript.addEventListener('error', () => reject(new Error('Failed to load XLSX runtime.')));
                return;
            }

            const script = document.createElement('script');
            script.src = XLSX_CDN_URL;
            script.async = true;
            script.onload = () => {
                if (!window.XLSX) {
                    reject(new Error('XLSX runtime loaded but global object is unavailable.'));
                    return;
                }
                resolve(window.XLSX);
            };
            script.onerror = () => reject(new Error('Failed to load XLSX runtime.'));
            document.head.appendChild(script);
        });
    }

    return xlsxLoaderPromise;
};

declare global {
    interface Window {
        XLSX?: any;
    }
}

