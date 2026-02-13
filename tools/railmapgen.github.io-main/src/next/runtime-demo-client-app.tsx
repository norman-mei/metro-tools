'use client';

import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import AppRoot from '../../runtime-demo/src/components/app-root';

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

export default function RuntimeDemoClientApp() {
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

    return <AppRoot />;
}
