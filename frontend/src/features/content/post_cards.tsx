import { Box } from "@mui/material"
import { Post } from "./post"
import { PostCard } from "./post_card"
import { FC } from "react"

interface props {
    posts: Post[]
}

export const PostCards: FC<props> = ({posts}) => {
    // Get posts from redux store

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "30px", px:"40px", paddingTop: "30px", paddingBottom:"200px"}}>
            {posts.map((post) => <PostCard key={post.id} {...post}></PostCard>)}
        </Box>
    )

}