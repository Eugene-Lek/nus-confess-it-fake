import { createSlice } from '@reduxjs/toolkit'

interface SideBarState {
  open: boolean
}

const initialState: SideBarState = {
  open: false
}

export const SideBarSlice = createSlice({
    name: 'SideBar',
    initialState,
    reducers: {
      clickedMenu: (state) => {
        state.open = !state.open
      },       
    },
  })
  
// Action creators are generated for each case reducer function
export const { clickedMenu } = SideBarSlice.actions

export default SideBarSlice.reducer