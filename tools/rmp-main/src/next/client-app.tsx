'use client';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
 
interface BootstrapResult {
    AppRoot: React.ComponentType;
    i18n: any;
    store: any;
}

let bootstrapPromise: Promise<BootstrapResult> | undefined;

const bootstrap = () => {
    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            const [
                { default: rmgRuntime },
                { default: AppRoot },
                { default: i18n },
                { default: store },
                { initStore },
            ] = await Promise.all([
                import('@railmapgen/rmg-runtime'),
                import('../components/app-root'),
                import('../i18n/config'),
                import('../redux'),
                import('../redux/init'),
            ]);

            await rmgRuntime.ready();
            await initStore(store);
            rmgRuntime.injectUITools();

            return { AppRoot, i18n, store };
        })();
    }
    return bootstrapPromise;
};

export default function ClientApp() {
    const [boot, setBoot] = React.useState<BootstrapResult | undefined>(undefined);

    React.useEffect(() => {
        let mounted = true;

        // In dev, clear stale service workers/caches that may keep old HMR clients alive.
        if (process.env.NODE_ENV !== 'production') {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                        void registration.unregister();
                    });
                });
            }
            if ('caches' in window) {
                caches.keys().then(keys => {
                    keys.forEach(key => {
                        void caches.delete(key);
                    });
                });
            }
        }

        bootstrap().then(result => {
            if (mounted) setBoot(result);
        });
        return () => {
            mounted = false;
        };
    }, []);

    if (!boot) {
        return (
            <p
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                Rail Map Painter protocol... checked
            </p>
        );
    }

    const { AppRoot, i18n, store } = boot;

    return (
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <AppRoot />
            </I18nextProvider>
        </Provider>
    );
}
