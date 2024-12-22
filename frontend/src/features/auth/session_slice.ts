import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface sessionState {
    authenticated: boolean
    username: string
}

const initialState: sessionState = {
    authenticated: typeof window === 'undefined' ? false : localStorage.getItem("authenticated") == "true" ,
    username: typeof window === 'undefined' ? "" : localStorage.getItem("username") || ""
}

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
      loggedIn: (state, action: PayloadAction<string>) => {
        // Note: This is only for UI convenience.
        //       Whether a user is authenticated and thus able to access certain endpoints
        //       will still depend on whether they have an active session
        state.authenticated = true
        state.username = action.payload

        // authentication state and username are stored in local storage upon authentication 
        // so that they are persisted even when the page is reloaded
        localStorage.setItem("authenticated", "true")
        localStorage.setItem("username", action.payload)
      },
      loggedOut: (state) => {
        state.authenticated = false
        state.username = ""

        localStorage.removeItem("authenticated")
        localStorage.removeItem("username")
      }
    },
  })
  
// Action creators are generated for each case reducer function
export const { loggedIn, loggedOut } = sessionSlice.actions

export default sessionSlice.reducer