'use client';

import { LoadingOverlay } from '@mantine/core';
import { RMErrorBoundary, RMMantineProvider } from '@railmapgen/mantine-components';
import rmgRuntime, { logger } from '@railmapgen/rmg-runtime';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import AppRoot from '../components/app-root';
import i18n from '../i18n/config';
import { overrideCanonicalLink } from '../inject-seo';
import store from '../redux';
import { fetchSubscription, syncAfterLogin } from '../redux/account/account-slice';
import { addRemoteFont, closeApp, isShowDevtools, openApp, updateTabMetadata } from '../redux/app/app-slice';
import initStore from '../redux/init';
import { addRemoteNotification } from '../redux/notification/notification-slice';
import { checkTokenAndRefresh } from '../util/api';
import { getAllowedAssetTypes, getAvailableAsset } from '../util/asset-enablements';
import { Events, FRAME_ID_PREFIX } from '../util/constants';
import { registerOnRMPSaveChange } from '../util/local-storage-save';

let bootstrapPromise: Promise<void> | undefined;
let initialized = false;

const setLegacyChakraColourMode = () => {
    const colourMode = rmgRuntime.getColourMode();

    if (colourMode === 'system') {
        if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) {
            window.localStorage.setItem('chakra-ui-color-mode', 'dark');
        } else {
            window.localStorage.setItem('chakra-ui-color-mode', 'light');
        }
    } else {
        window.localStorage.setItem('chakra-ui-color-mode', colourMode);
    }
};

const registerRuntimeListeners = () => {
    rmgRuntime.onAppOpen(app => {
        const allowedAssetTypes = getAllowedAssetTypes(isShowDevtools(store.getState().app.lastShowDevtools));
        const availableApps = allowedAssetTypes
            .map(type => getAvailableAsset(type, rmgRuntime.getEnv(), rmgRuntime.getInstance()))
            .flat();
        if (availableApps.includes(app.appId)) {
            store.dispatch(openApp(app));
        }
    });

    rmgRuntime.onAppClose(app => {
        store.dispatch(closeApp(app));
    });

    rmgRuntime.onAppMetadataUpdate((metadata, frameId) => {
        if (frameId) {
            const id = frameId.slice(FRAME_ID_PREFIX.length);
            logger.info(`Received metadata update for frame=${id}, metadata is`, metadata);
            store.dispatch(updateTabMetadata({ ...metadata, id }));
        }
    });

    rmgRuntime.onRemoteFontLoaded(({ family, definition: { displayName, url } }) => {
        store.dispatch(addRemoteFont({ family, config: { displayName, url } }));
    });

    rmgRuntime.onNewNotification(payload => {
        store.dispatch(addRemoteNotification(payload));
    });
};

const bootstrap = async () => {
    if (initialized) {
        return;
    }

    await rmgRuntime.ready();
    initStore(store);

    await checkTokenAndRefresh(store, true);
    await store.dispatch(syncAfterLogin());
    store.dispatch(fetchSubscription());

    setLegacyChakraColourMode();
    registerRuntimeListeners();
    rmgRuntime.event(Events.APP_LOAD, { openedApps: store.getState().app.openedTabs.map(tab => tab.app) });
    registerOnRMPSaveChange(store);
    overrideCanonicalLink();

    initialized = true;
};

const ensureBootstrapped = () => {
    if (!bootstrapPromise) {
        bootstrapPromise = bootstrap();
    }
    return bootstrapPromise;
};

export default function MainClientApp() {
    const [ready, setReady] = React.useState(initialized);

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
        return (
            <RMMantineProvider>
                <LoadingOverlay visible />
            </RMMantineProvider>
        );
    }

    return (
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <RMMantineProvider>
                    <RMErrorBoundary suspenseFallback={<LoadingOverlay visible />} allowReset>
                        <AppRoot />
                    </RMErrorBoundary>
                </RMMantineProvider>
            </I18nextProvider>
        </Provider>
    );
}
