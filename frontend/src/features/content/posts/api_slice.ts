import { baseApiSlice } from "@/redux/api";
import { NewPost, Post } from "./post_types";

interface GetPostProps {
    query?: string,
    tags?: string[],
    sortBy?: string
    status?: "Draft" | "Published"
    author?: string,
    likedBy?: string,
}

interface NewPostVote {
    postId: string,
    vote: "Like" | "Dislike"
}

const postsApi = baseApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createPost: builder.mutation<void, NewPost>({
            query: post => ({
              url: `/posts/${post.id}`,
              method: 'POST',
              body: post
            }),
            invalidatesTags: ['Post']
        }),

        updatePost: builder.mutation<void, NewPost>({
            query: post => ({
              url: `/posts/${post.id}`,
              method: 'PUT',
              body: post
            }),
            invalidatesTags: ['Post']
        }),
        updateDraftToPost: builder.mutation<void, NewPost>({
            query: post => ({
              url: `/posts/${post.id}/conversion`,
              method: 'POST',
              body: post
            }),
            invalidatesTags: ['Post']
        }),        

        getPostById: builder.query<Post, string>({
            query: postId => `/posts/${postId}`,
            providesTags: ['Post']
        }),
        getPosts: builder.query<Post[], GetPostProps>({
          query: (props) => `/posts?query=${props.query}&sortBy=${props.sortBy}${props.tags?.map((tag) => `&tag=${tag}`).join("")}`,
          providesTags: ['Post']
        }),
        getMyPosts: builder.query<Post[], GetPostProps>({
            query: (props) => `users/${props.author}/posts?query=${props.query}&sortBy=${props.sortBy}${props.tags?.map((tag) => `&tag=${tag}`).join("")}`,
            providesTags: ['Post']
        }),
        getMyDrafts: builder.query<Post[], GetPostProps>({
            query: (props) => `users/${props.author}/drafts?query=${props.query}&sortBy=${props.sortBy}${props.tags?.map((tag) => `&tag=${tag}`).join("")}`,
            providesTags: ['Post']
        }),
        getLikedPosts: builder.query<Post[], GetPostProps>({
            query: (props) => `users/${props.likedBy}/liked-posts?query=${props.query}&sortBy=${props.sortBy}${props.tags?.map((tag) => `&tag=${tag}`).join("")}`,
            providesTags: ['Post']
        }),

        deletePost: builder.mutation<void, string>({
            query: id => ({
              url: `/posts/${id}`,
              method: 'DELETE',
            }),
            invalidatesTags: ['Post']
        }),

        upsertPostVote: builder.mutation<void, NewPostVote>({
            query: postVote => ({
              url: `/posts/${postVote.postId}/vote`,
              method: 'PUT',
              body: postVote
            }),
            invalidatesTags: ['Post']            
        }),  
        deletePostVote: builder.mutation<void, string>({
            query: postId => ({
              url: `/posts/${postId}/vote`,
              method: 'DELETE',
            }),
            invalidatesTags: ['Post']            
        }),        

        getTags: builder.query<string[], void>({
            query: () => '/tags'
        }),
      })
})

export const {
    useCreatePostMutation,
    useUpdatePostMutation,
    useUpdateDraftToPostMutation,
    useGetPostByIdQuery,
    useGetPostsQuery,
    useGetMyPostsQuery,
    useGetMyDraftsQuery,
    useGetLikedPostsQuery, 
    useDeletePostMutation,
    useUpsertPostVoteMutation,
    useDeletePostVoteMutation,
    useGetTagsQuery 
} = postsApi