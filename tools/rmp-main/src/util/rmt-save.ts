import { logger } from '@railmapgen/rmg-runtime';
import { LocalStorageKey } from '../constants/constants';
import { createStore, RootDispatch } from '../redux';
import { setState, setToken } from '../redux/account/account-slice';

export const SAVE_MANAGER_CHANNEL_NAME = 'rmt-save-manager';
export enum SaveManagerEventType {
    SAVE_CHANGED = 'SAVE_CHANGED',
}
export interface SaveManagerEvent {
    type: SaveManagerEventType;
    key?: LocalStorageKey.PARAM;
    token?: string;
    from: 'rmp' | 'rmt';
}

export const saveManagerChannel = new BroadcastChannel(SAVE_MANAGER_CHANNEL_NAME);

// Notify rmt to update save when the state is changed.
export const onRMPSaveUpdate = () => {
    logger.debug('Notify RMP save change');
    saveManagerChannel.postMessage({
        type: SaveManagerEventType.SAVE_CHANGED,
        key: LocalStorageKey.PARAM,
        from: 'rmp',
    } as SaveManagerEvent);
};

const updateToken = async (store: ReturnType<typeof createStore>, token: string) => {
    logger.debug(`Updating token to: ${token}`);
    store.dispatch(setToken(token));
};

export const fetchLoginState = async (dispatch: RootDispatch, token: string) => {
    if (!token) {
        dispatch(setState('logged-out'));
        return;
    }

    dispatch(setState('logged-in'));
    logger.debug('Token is available, setting logged-in state');
};

/**
 * Account state managed and persisted to localStorage by RMT.
 * Read Only.
 */
interface AccountState {
    id: number;
    name: string;
    email: string;
    token: string;
    expires: string;
    refreshToken: string;
    refreshExpires: string;
}

/**
 * Watch the localStorage change and update the login state and token.
 */
export const onLocalStorageChangeRMT = (store: ReturnType<typeof createStore>) => {
    const handleAccountChange = (accountString?: string) => {
        if (!accountString) {
            logger.debug('Account string is empty, logging out');
            store.dispatch(setToken(undefined));
            store.dispatch(setState('logged-out'));
            return;
        }

        const accountState = JSON.parse(accountString) as AccountState;
        const { token } = accountState;
        updateToken(store, token);
        fetchLoginState(store.dispatch, token);
    };

    // Record the previous account string and only handle the change.
    let previousAccountString = localStorage.getItem(LocalStorageKey.ACCOUNT);
    handleAccountChange(previousAccountString ?? undefined);

    window.onstorage = () => {
        const accountString = localStorage.getItem(LocalStorageKey.ACCOUNT);
        if (previousAccountString === accountString) {
            return;
        }
        previousAccountString = accountString;

        logger.debug(`Account string changed to: ${accountString}`);
        handleAccountChange(accountString ?? undefined);
    };
};
