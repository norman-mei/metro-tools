'use client';

import rmgRuntime, { logger } from '@railmapgen/rmg-runtime';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import AppRoot from '../components/app-root';
import i18n from '../i18n/config';
import store from '../redux';
import { initPickerState, initStore } from '../redux/init';
import { setCityList, setCountryList, setIsDataLoading } from '../redux/app/app-slice';
import { Events } from '../util/constants';
import { getCityList, getCountryList } from '@railmapgen/rmg-palette-resources';

let bootstrapPromise: Promise<void> | undefined;

const loadReferenceData = async () => {
    const [cityListResult, countryListResult] = await Promise.allSettled([getCityList(), getCountryList()]);

    if (cityListResult.status === 'fulfilled') {
        store.dispatch(setCityList(cityListResult.value));
    } else {
        logger.error('Unable to load city list', cityListResult.reason);
    }

    if (countryListResult.status === 'fulfilled') {
        store.dispatch(setCountryList(countryListResult.value));
    } else {
        logger.error('Unable to load country list', countryListResult.reason);
    }

    store.dispatch(setIsDataLoading(false));
    await initPickerState(store);
};

const bootstrap = async () => {
    await rmgRuntime.ready();
    initStore(store);
    rmgRuntime.injectUITools();
    rmgRuntime.event(Events.APP_LOAD, { isStandaloneWindow: rmgRuntime.isStandaloneWindow() });
    void loadReferenceData();
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
