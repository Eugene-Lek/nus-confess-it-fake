import { errorOccured } from '@/features/popups/popup_slice'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { AppDispatch } from './store'

export const baseApiSlice = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_PROTOCOL}://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/api/v${process.env.NEXT_PUBLIC_API_VERSION}`, 
    credentials: "include"
  }),
  tagTypes: ["Post", "Comment"],
  endpoints: () => ({})
})

export function isFetchBaseQueryError(error: any  ): error is { data: {message: string }} {
    return typeof error === 'object' && error != null && error.data && error.data.message
}  

export const defaultFetchErrorHandler = (error: any, dispatch: AppDispatch) => {
  if (error) {
    if (isFetchBaseQueryError(error)) {
      dispatch(errorOccured(error.data.message))
    } else {
      dispatch(errorOccured(JSON.stringify(error)))
    }
  }
}
