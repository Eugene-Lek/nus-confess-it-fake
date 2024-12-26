import popupReducer from '@/features/popups/popup_slice'
import filterReducer from '@/features/topbar/filter_slice'
import { configureStore } from '@reduxjs/toolkit'
import { baseApiSlice } from './api';

export const Store = configureStore({
  reducer: {
    popup: popupReducer,
    filter: filterReducer,
    [baseApiSlice.reducerPath]: baseApiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(baseApiSlice.middleware)
})

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;