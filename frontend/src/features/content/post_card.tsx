import { FC, PropsWithChildren, useState } from "react";
import { Post } from "./post";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { VoteBox } from "./vote_box";

export const PostCard = (post: Post) => {
    const router = useRouter() // Use to route the user to a particular post when they click on it

    return (
        <Box onClick={() => {router.push(`/posts/${post.id}`)}} sx={{display: "flex", flexDirection: "column", gap: "5px", border: 1.7, borderRadius:10, borderColor: "#d3d3d3", py: 1, px: 5, cursor:"pointer"}}>
            <Typography variant="body1" fontWeight={"bold"}>{post.title}</Typography>
            <Typography variant="body2" sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
            }}>{post.body}</Typography>
            <Box sx={{display: "flex", flexDirection: "row", gap: "25px"}}>
                <VoteBox {...post}/>
                <Box sx={{display: "flex", gap:"15px"}}>
                {post.tags.map((tag) => (
                        <Box key={tag} sx={{border: 1, borderRadius:10, borderColor:"#F2F3F3", boxShadow: 1, px: 2, backgroundColor: "#F2F3F3"}}>
                            <Typography key={tag} variant="body2">{tag}</Typography>
                        </Box>
                ))}
                </Box>
            </Box>
        </Box>
    )
}