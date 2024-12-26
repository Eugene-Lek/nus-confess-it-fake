import { baseApiSlice } from "@/redux/api";
import { Comment, NewComment } from "./comment_types";

interface getCommentProps {
    query?: string,
    sortBy?: string,
    author?: string,
    likedBy?: string,
}

interface NewCommentVote {
    commentId: string,
    vote: "Like" | "Dislike"
}

const commentsApi = baseApiSlice.injectEndpoints({
    endpoints: (builder) => ({ 
        createComment: builder.mutation<void, NewComment>({
            query: comment => ({
              url: `/comments/${comment.id}`,
              method: 'POST',
              body: comment
            }),
            invalidatesTags: ["Comment"]
        }),

        updateComment: builder.mutation<void, NewComment>({
            query: comment => ({
              url: `/comments/${comment.id}`,
              method: 'PUT',
              body: comment
            }),
            invalidatesTags: ["Comment"]
        }),

        getCommentsByPostId: builder.query<Comment[], string>({
            query: postId => `/posts/${postId}/comments`,
            providesTags: ['Comment']
        }),
        getMyComments: builder.query<Comment[], getCommentProps>({
            query: (props) => `users/${props.author}/comments?query=${props.query}&sortBy=${props.sortBy}`,
            providesTags: ['Comment']
        }),
        getLikedComments: builder.query<Comment[], getCommentProps>({
            query: (props) => `users/${props.likedBy}/liked-comments?query=${props.query}&sortBy=${props.sortBy}`,
            providesTags: ['Comment']
        }),

        deleteComment: builder.mutation<void, string>({
            query: id => ({
              url: `/comments/${id}`,
              method: 'DELETE',
            }),
            invalidatesTags: ["Comment"]
        }),

        upsertCommentVote: builder.mutation<void, NewCommentVote>({
            query: commentVote => ({
              url: `/comments/${commentVote.commentId}/vote`,
              method: 'PUT',
              body: commentVote
            }),
            invalidatesTags: ["Comment"]            
        }),  
        deleteCommentVote: builder.mutation<void, string>({
            query: commentId => ({
              url: `/comments/${commentId}/vote`,
              method: 'DELETE',
            }),
            invalidatesTags: ["Comment"]            
        }),   
      })
})

export const {
    useCreateCommentMutation,
    useUpdateCommentMutation,
    useGetCommentsByPostIdQuery,
    useGetMyCommentsQuery,
    useGetLikedCommentsQuery,
    useDeleteCommentMutation,
    useUpsertCommentVoteMutation,
    useDeleteCommentVoteMutation,
} = commentsApi