'use client';

import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import AppRoot from '../../contributors/src/components/app-root';
import i18n from '../i18n/config';

let bootstrapPromise: Promise<void> | undefined;

const bootstrap = async () => {
    await rmgRuntime.ready();
    rmgRuntime.injectUITools();
};

const ensureBootstrapped = () => {
    if (!bootstrapPromise) {
        bootstrapPromise = bootstrap();
    }
    return bootstrapPromise;
};

export default function ContributorsClientApp() {
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;

        void ensureBootstrapped().then(() => {
            if (mounted) {
                setReady(true);
            }
        });

        return () => {
            mounted = false;
        };
    }, []);

    if (!ready) {
        return null;
    }

    return (
        <I18nextProvider i18n={i18n}>
            <AppRoot />
        </I18nextProvider>
    );
}
