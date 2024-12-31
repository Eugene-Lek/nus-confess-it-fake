import { Post } from "./post_types";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { VoteBox } from "../vote_box";
import { removeNewlines } from "../utils";
import { PostEditDeleteMenu } from "./post_edit_delete_menu";
import styles from "../content.module.css"

export const PostCard = (post: Post) => {
    const router = useRouter() // Use to route the user to a particular post when they click on it

    const onClick = () => {
        if (post.status == "Draft") {
            router.push(`/edit?postId=${post.id}`)
        } else {
            router.push(`/posts/${post.id}`)            
        }
    }

    return (
        <Box onClick={onClick} className={`maximise-width ${styles.card}`} sx={{cursor:"pointer"}}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                <Box>
                    {post.status == "Deleted"
                        ? <Typography variant="body1" color="grey" fontWeight={"bold"}>{"[Deleted]"}</Typography>  
                        : <Typography variant="body1" fontWeight={"bold"}>{post.title}</Typography>
                    }                         
                    <Typography variant="body2" sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: "3",
                            WebkitBoxOrient: "vertical",
                    }}>{removeNewlines(post.body)}</Typography>                    
                </Box>
                <PostEditDeleteMenu {...post}/>
            </Box>
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