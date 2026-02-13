import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StationCity } from '../../constants/constants';

/**
 * AppState contains all the settings users want to preserve after restart.
 * However non of them should be included in the save.
 */
export interface AppState {
    preference: {
        /**
         * Settings for the tools panel.
         */
        toolsPanel: {
            /**
             * Whether to expand the tools panel. Remembered for next run.
             */
            expand: boolean;
        };
        /**
         * Whether to enable parallel for new lines.
         */
        autoParallel: boolean;
        /**
         * If true, line tool keeps active after drawing until clicking background.
         */
        keepLastPath: boolean;
        /**
         * Theme mode used by Chakra/RMG.
         */
        themeMode: 'light' | 'dark' | 'system';
        randomStationsNames: 'none' | StationCity;
        gridLines: boolean;
        snapLines: boolean;
        predictNextNode: boolean;
        autoChangeStationType: boolean;
        /**
         * Whether to disable warnings.
         */
        disableWarning: {
            /**
             * Whether to disable the change type warning dialog when changing station/line types.
             */
            changeType: boolean;
        };
    };
}

export const initialState: AppState = {
    preference: {
        toolsPanel: {
            expand: true,
        },
        autoParallel: true,
        keepLastPath: false,
        themeMode: 'system',
        randomStationsNames: 'none',
        gridLines: false,
        snapLines: true,
        predictNextNode: true,
        autoChangeStationType: true,
        disableWarning: {
            changeType: false,
        },
    },
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setToolsPanelExpansion: (state, action: PayloadAction<boolean>) => {
            state.preference.toolsPanel.expand = action.payload;
        },
        setAutoParallel: (state, action: PayloadAction<boolean>) => {
            state.preference.autoParallel = action.payload;
        },
        setKeepLastPath: (state, action: PayloadAction<boolean>) => {
            state.preference.keepLastPath = action.payload;
        },
        setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
            state.preference.themeMode = action.payload;
        },
        setRandomStationsNames: (state, action: PayloadAction<'none' | StationCity>) => {
            state.preference.randomStationsNames = action.payload;
        },
        setGridLines: (state, action: PayloadAction<boolean>) => {
            state.preference.gridLines = action.payload;
        },
        setSnapLines: (state, action: PayloadAction<boolean>) => {
            state.preference.snapLines = action.payload;
        },
        setPredictNextNode: (state, action: PayloadAction<boolean>) => {
            state.preference.predictNextNode = action.payload;
        },
        setAutoChangeStationType: (state, action: PayloadAction<boolean>) => {
            state.preference.autoChangeStationType = action.payload;
        },
        setDisableWarningChangeType: (state, action: PayloadAction<boolean>) => {
            state.preference.disableWarning.changeType = action.payload;
        },
    },
});

export const {
    setToolsPanelExpansion,
    setAutoParallel,
    setKeepLastPath,
    setThemeMode,
    setRandomStationsNames,
    setGridLines,
    setSnapLines,
    setPredictNextNode,
    setAutoChangeStationType,
    setDisableWarningChangeType,
} = appSlice.actions;
export default appSlice.reducer;
