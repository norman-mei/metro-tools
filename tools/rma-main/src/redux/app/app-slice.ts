import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VoiceName } from '../../constants/constants';
import { Services } from '../../constants/rmg';

interface AppState {
    preference: {
        import: {
            route: number;
            service: Services;
        };
        /**
         * Preview audio voice name from the current Speech Synthesis API for each VoiceName.
         */
        previewAudio: { [k in VoiceName]?: string };
    };
}

const initialState: AppState = {
    preference: {
        import: {
            route: 0,
            service: Services.local,
        },
        previewAudio: {},
    },
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setPreferenceImport: (state, action: PayloadAction<AppState['preference']['import']>) => {
            state.preference.import = action.payload;
        },
        setPreviewAudioBulk: (state, action: PayloadAction<AppState['preference']['previewAudio']>) => {
            state.preference.previewAudio = action.payload;
        },
        setPreviewAudio: (state, action: PayloadAction<[VoiceName, string]>) => {
            const [voiceName, systemTTSVoiceName] = action.payload;
            state.preference.previewAudio[voiceName] = systemTTSVoiceName;
        },
        removePreviewAudio: (state, action: PayloadAction<VoiceName>) => {
            if (state.preference.previewAudio[action.payload]) {
                delete state.preference.previewAudio[action.payload];
            }
        },
    },
});

export const { setPreferenceImport, setPreviewAudioBulk, setPreviewAudio, removePreviewAudio } = appSlice.actions;
export default appSlice.reducer;
