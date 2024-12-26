import { baseApiSlice } from "@/redux/api";

interface user {
    username: string,
    password: string
}

const authApi = baseApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createUser: builder.mutation<void, user>({
            query: user => ({
              // The HTTP URL will be '/fakeApi/posts'
              url: `/users/${user.username}`,
              // This is an HTTP POST request, sending an update
              method: 'POST',
              // Include the entire post object as the body of the request
              body: user
            })
        }),

        login: builder.mutation<void, user>({
            query: user => ({
              // The HTTP URL will be '/fakeApi/posts'
              url: `/session`,
              // This is an HTTP POST request, sending an update
              method: 'POST',
              // Include the entire post object as the body of the request
              body: user
            })
        }),

        logout: builder.mutation<void, void>({
            query: () => ({
              // The HTTP URL will be '/fakeApi/posts'
              url: `/session`,
              // This is an HTTP POST request, sending an update
              method: 'DELETE',
            })
        }),
      })
})

export const {
    useCreateUserMutation,
    useLoginMutation,
    useLogoutMutation
} = authApi