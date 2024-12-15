import popupReducer from '@/features/popups/popup_slice'
import sessionReducer from '@/features/global/session_slice'
import { configureStore } from '@reduxjs/toolkit'

export const Store =configureStore({
  reducer: {
    popup: popupReducer,
    session: sessionReducer,
  },
})

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;