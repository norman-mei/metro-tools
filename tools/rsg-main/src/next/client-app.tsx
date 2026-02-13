'use client';

import rmgRuntime from '@railmapgen/rmg-runtime';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import AppRoot from '../components/app-root';
import i18n from '../i18n/config';
import store from '../redux';
import initStore from '../redux/init';
import { Events } from '../util/constant';

let bootstrapPromise: Promise<void> | undefined;

const bootstrap = async () => {
    await rmgRuntime.ready();
    initStore(store);
    rmgRuntime.injectUITools();
    rmgRuntime.event(Events.APP_LOAD, {});
};

const ensureBootstrapped = () => {
    if (!bootstrapPromise) {
        bootstrapPromise = bootstrap();
    }
    return bootstrapPromise;
};

export default function ClientApp() {
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
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <AppRoot />
            </I18nextProvider>
        </Provider>
    );
}
