import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PopupState {
    type: "closed" | "error" | "login" | "signup"
    loading: boolean
    error: undefined | string
}

const initialState: PopupState = {
    type: "closed",
    loading: false,
    error: "Invalid username or password",
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
        state.type = "closed"
        state.loading = false
        state.error = undefined
      },
      clickedLogin: (state) => {
        state.type = "login"
        state.loading = false
        state.error = undefined
      },
      clickedSignup: (state) => {
        state.type = "signup"
        state.loading = false
        state.error = undefined
      },
      clickedSubmit: (state) => {
        state.loading = true
      },
      errorOccured: (state, action: PayloadAction<string>) => {
        state.error = action.payload
      },
    },
  })
  
// Action creators are generated for each case reducer function
export const { closed, clickedLogin, clickedSignup, clickedSubmit, errorOccured } = popupSlice.actions

export default popupSlice.reducer