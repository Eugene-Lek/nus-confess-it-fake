import { MouseEvent, useState } from "react"
import { Post } from "./post"
import { Box, Typography } from "@mui/material"
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import { Comment } from "./comment_card";


export const VoteBox = (submission: Post | Comment) => {
    const checkIsPost = (value: any): value is Post => !!value?.title;
    const isPost = checkIsPost(submission)
    const [currentVote, setVote] = useState("")

    // A local version of the post/comment's like and dislike state is created and tracked
    // This way, we don't have to update the redux state of *all* posts/comments whenever
    // we want to update the like/dislike count of a *single* post/comment.
    // Instead we will display the change first and then update the database. 
    // Both states will eventually be consistent
    const [likes, setLikes] = useState(submission.likes)
    const [dislikes, setDislikes] = useState(submission.dislikes)

    // TODO
    const updateBackend = async(vote: "like" | "dislike", action: "create" | "delete") => {
        const method = action == "create" ? "POST" : "DELETE"
        /*
        await fetch(`${isPost ? "posts" : "comments"}/${submission.id}/vote`, {
            method: method,
            body: JSON.stringify({
                vote: vote
            })
        })
        */
    }


    const onClickLike = async(event: MouseEvent<SVGSVGElement>) => {
        event.stopPropagation()

        if (currentVote == "like") {
            setVote("")
            setLikes(likes - 1)
            await updateBackend("like", "delete")

        } else if (currentVote == "dislike"){
            setVote("like")
            setLikes(likes + 1)
            setDislikes(dislikes - 1)
            await updateBackend("like", "create")
            await updateBackend("dislike", "delete")

        } else {
            setVote("like")
            setLikes(likes + 1)
            await updateBackend("like", "create")

        }
    }

    const onClickDislike = async(event: MouseEvent<SVGSVGElement>) => {
        event.stopPropagation()
        
        if (currentVote == "dislike") {
            setVote("")
            setDislikes(dislikes - 1)
            await updateBackend("dislike", "delete")

        } else if (currentVote == "like"){
            setVote("dislike")
            setDislikes(dislikes + 1)
            setLikes(likes - 1)
            await updateBackend("dislike", "create")
            await updateBackend("like", "delete")

        } else {
            setVote("dislike")
            setDislikes(dislikes + 1)
            await updateBackend("dislike", "create")
        }
        }
            

    return (
        <Box sx={{display: "flex", flexDirection: "row", gap: "25px"}}>
            <Box sx={{display: "flex", flexDirection: "row", gap: "5px", cursor: 'pointer'}}>
                <Typography variant="body2">{likes}</Typography>
                {currentVote == "like" ? <ThumbUpAltIcon id="like" onClick={onClickLike}/> : <ThumbUpOffAltIcon id="like" onClick={onClickLike}/>}
            </Box>
            <Box sx={{display: "flex", flexDirection: "row", gap: "5px", cursor: 'pointer'}}>
                <Typography variant="body2">{dislikes}</Typography>
                {currentVote == "dislike" ? <ThumbDownAltIcon id="dislike" onClick={onClickDislike}/> : <ThumbDownOffAltIcon id="dislike" onClick={onClickDislike}/>}
            </Box>       
        </Box>
    )
}