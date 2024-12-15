import { Box, SxProps, Theme, Typography } from "@mui/material"
import { Comment } from "./comment_card"
import { FC } from "react"

export interface ParentComment {
    id: string,
    author: string,
    body: string,   
}

export const ParentCommentCard = (parentComment: ParentComment) => {
    return (
        <Box sx={{borderLeft: 3, borderColor: "#F3A953", px: 3, my: 1}}>
            <Typography variant="body2" fontWeight={"bold"}>{`${parentComment.author} `}</Typography>
            <Typography variant="body2" sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: "2",
                    WebkitBoxOrient: "vertical",
            }}>{parentComment.body}</Typography>                
        </Box> 
    )
}