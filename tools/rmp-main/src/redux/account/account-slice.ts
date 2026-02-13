import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * AccountState contains information of the current user.
 * Note login and management part should leave to rmg-home and only authenticate here.
 */
export interface AccountState {
    state: 'logged-out' | 'logged-in' | 'expired';
    /**
     * Use this token to communicate with server.
     * Must be up to date as it is updated on storage event in onLocalStorageChangeRMT.
     * Undefined means not logged in.
     *
     * (Optional) If the subsequent request returns 401, call requestToken to refresh
     * it on RMT side, and then retry the request.
     */
    token: string | undefined;
}

export const initialState: AccountState = {
    state: 'logged-out',
    token: undefined,
};

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setState: (state, action: PayloadAction<AccountState['state']>) => {
            state.state = action.payload;
        },
        setToken: (state, action: PayloadAction<string | undefined>) => {
            state.token = action.payload;
        },
    },
});

export const { setState, setToken } = accountSlice.actions;
export default accountSlice.reducer;
