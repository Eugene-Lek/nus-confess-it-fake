import { Box, Typography } from "@mui/material"
import { VoteBox } from "./vote_box"
import ReplyIcon from '@mui/icons-material/Reply';
import { ParentCommentCard } from "./parent_comment";
import { Dispatch, FC, SetStateAction } from "react";
import { formatDate } from "./utils";

export interface Comment {
    id: string,
    body: string,
    likes: number,
    dislikes: number,
    author: string,
    createdAt: string, 
    updatedAt: string,
    parentId: string,
    parentAuthor: string,
    parentBody: string,
}

const CommentCardCore = (comment: Comment) =>  {
    const parentComment = {
        id: comment.parentId, 
        author: comment.parentAuthor, 
        body: comment.parentBody
    }

    return (
        <>
            <Box sx={{display: "flex"}}>
                <Typography variant="body2" fontWeight={"bold"}>{`${comment.author} `}</Typography>
                <Typography variant="body2" color="grey">{`, ${formatDate(new Date(comment.createdAt))}`}</Typography>
            </Box>
            {comment.parentId ? <ParentCommentCard {...parentComment}/> : <></> }
            <Typography variant="body2">{comment.body}</Typography>
        </>
    )
}

interface props {
    comment: Comment,
    setReplyTo: Dispatch<SetStateAction<Comment | undefined>>
}

export const CommentCardUnderPost: FC<props> = ({comment, setReplyTo}) => {
    return (
        <Box id={comment.id} sx={{display: "flex", flexDirection: "column", gap: "5px", border: 1.7, borderRadius:10, borderColor: "#d3d3d3", py: 1, px: 5}}>
            <CommentCardCore {...comment}/>
            <Box sx={{display: "flex", flexDirection: "row", gap: "25px"}}>
                <VoteBox {...comment}/>
                <Box onClick={() => {setReplyTo(comment)}} sx={{display: "flex", flexDirection: "row", gap: "5px",cursor: 'pointer'}}>
                    <Typography variant="body2" fontWeight={"bold"}>Reply</Typography>
                    <ReplyIcon/>
                </Box>
            </Box>
        </Box>
    )
}

export const CommentCardInListing = (comment: Comment) => {
    return (
        <Box id={comment.id} sx={{display: "flex", flexDirection: "column", gap: "5px", border: 1.7, borderRadius:10, borderColor: "#d3d3d3", py: 1, px: 5}}>
            <CommentCardCore {...comment}/>
            <Box sx={{display: "flex", flexDirection: "row", gap: "25px"}}>
                <VoteBox {...comment}/>
            </Box>
        </Box>
    )
}