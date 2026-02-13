'use client';

import rmgRuntime from '@railmapgen/rmg-runtime';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import i18n from '../i18n/config';
import store from '../redux';
import initStore from '../redux/init';
import { onLocalStorageChangeRMT } from '../util/token';
import AppRoot from './app-root';

let appInitialized = false;

export default function AppBootstrap() {
    const [ready, setReady] = useState(appInitialized);

    useEffect(() => {
        if (appInitialized) {
            setReady(true);
            return;
        }

        let cancelled = false;
        const initialize = async () => {
            await rmgRuntime.ready();

            if (cancelled) {
                return;
            }

            initStore(store);
            rmgRuntime.injectUITools();
            onLocalStorageChangeRMT(store);
            appInitialized = true;
            setReady(true);
        };

        void initialize();

        return () => {
            cancelled = true;
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
