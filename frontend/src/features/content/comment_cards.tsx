import { Box, SxProps, Theme } from "@mui/material"
import { Comment } from "./comment_card"
import { CommentCardUnderPost, CommentCardInListing } from "./comment_card"
import { Dispatch, FC, SetStateAction } from "react"

interface props1 {
    comments: Comment[]
    setReplyTo: Dispatch<SetStateAction<Comment | undefined>>
}

export const CommentCardsUnderPost: FC<props1> = ({comments, setReplyTo}) => {
    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px"}}>
            {comments.map((comment) => <CommentCardUnderPost key={comment.id} comment={comment} setReplyTo={setReplyTo}></CommentCardUnderPost>)}
        </Box>
    )
}

interface props2 {
    comments: Comment[]
}

export const CommentCardsInListing: FC<props2> = ({comments}) => {
    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px", px:"40px", paddingTop: "30px", paddingBottom:"200px"}}>
            {comments.map((comment) => <CommentCardInListing key={comment.id} {...comment}></CommentCardInListing>)}
        </Box>
    )
}