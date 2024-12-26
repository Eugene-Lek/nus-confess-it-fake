import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface FilterState {
    query: string
    tags: string[]
    sortBy: string
    hideQueryFilter: boolean
    hideTagFilter: boolean
}

const initialState: FilterState = {
    query: "",
    tags: [],
    sortBy: "Newest",
    hideQueryFilter: false,
    hideTagFilter: false,
}

export const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
      queryUpdated: (state, action: PayloadAction<string>) => {
        state.query = action.payload
      },
      tagsUpdated: (state, action: PayloadAction<string[]>) => {
        state.tags = action.payload
      },
      sortByUpdated: (state, action: PayloadAction<string>) => {
        state.sortBy = action.payload
      },
      filterCleared: (state) => {
        state.query = initialState.query
        state.tags = initialState.tags
        state.sortBy = initialState.sortBy
      },
      hideTagFilter: (state) => {
        state.hideTagFilter = true
      },
      showTagFilter: (state) => {
        state.hideTagFilter = false
      },      
      hideBothFilters: (state) => {
        state.hideTagFilter = true
        state.hideQueryFilter = true
      },
      showBothFilters: (state) => {
        state.hideTagFilter = false
        state.hideQueryFilter = false
      }        
    },
  })
  
// Action creators are generated for each case reducer function
export const { 
  queryUpdated, 
  tagsUpdated, 
  sortByUpdated, 
  filterCleared, 
  hideTagFilter, 
  showTagFilter,
  hideBothFilters,
  showBothFilters
} = filterSlice.actions

export default filterSlice.reducer