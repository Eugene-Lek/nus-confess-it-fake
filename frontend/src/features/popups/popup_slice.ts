import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PopupState {
    type: "error" | "login" | "signup" | "delete confirmation" | undefined
    open: boolean
    error: undefined | string
    props: any
}

const initialState: PopupState = {
    type: undefined,
    open: false,
    error: "Invalid username or password",
    props: {},
}

export const popupSlice = createSlice({
    name: 'popup',
    initialState,
    reducers: {
      closed: (state) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes.
        // Also, no return statement is required from these functions.
        state.type = undefined
        state.open = false
        state.error = undefined
      },
      clickedLogin: (state) => {
        state.type = "login"
        state.open = true
        state.error = undefined
      },
      clickedSignup: (state) => {
        state.type = "signup"
        state.open = true
        state.error = undefined
      },
      clickedDelete: (state, action: PayloadAction<{isDeleting: boolean, resourceId: string}>) => {
        state.type = "delete confirmation"
        state.open = true
        state.error = undefined
        state.props = action.payload
      },
      errorOccured: (state, action: PayloadAction<string>) => {
        state.error = action.payload

        // If popup is currently open, display the error on the existing popup
        // Otherwise, open the default error popup
        if (!state.open) {
            state.type =  "error"
            state.open = true
        }
      },
    },
  })
  
// Action creators are generated for each case reducer function
export const { closed, clickedLogin, clickedSignup, clickedDelete, errorOccured } = popupSlice.actions

export default popupSlice.reducer