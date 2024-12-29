import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Box, Typography } from "@mui/material";
import { MouseEvent, useState } from "react";
import { userIsLoggedIn } from "../auth/auth";
import { clickedLogin } from "../popups/popup_slice";
import { useDeleteCommentVoteMutation, useUpsertCommentVoteMutation } from "./comments/api_slice";
import { Comment } from "./comments/comment_types";
import { useDeletePostVoteMutation, useUpsertPostVoteMutation } from "./posts/api_slice";
import { Post } from "./posts/post_types";


const checkIsPost = (value: any): value is Post => !!value?.title;

export const VoteBox = (submission: Post | Comment) => {
    const [currentVote, setVote] = useState(submission.userVote)

    // A local version of the post/comment's like and dislike state is created and tracked
    // This way, we don't have to update the redux state of *all* posts/comments whenever
    // we want to update the like/dislike count of a *single* post/comment.
    // Instead we will display the change first and then update the database. 
    // Both states will eventually be consistent
    const [likes, setLikes] = useState(submission.likes)
    const [dislikes, setDislikes] = useState(submission.dislikes)

    const authenticated = userIsLoggedIn()
    const dispatch = useAppDispatch()

    const onClickLike = async(event: MouseEvent<SVGSVGElement>) => {
        event.stopPropagation()

        // If the user has not logged in, prompt them to do so
        if (!authenticated) {
            dispatch(clickedLogin())
            return
        }

        if (currentVote == "Like") {
            setVote("")
            setLikes(likes - 1)
            await updateBackend("Like", "Delete")
        } else if (currentVote == "Dislike"){
            setVote("Like")
            setLikes(likes + 1)
            setDislikes(dislikes - 1)
            await updateBackend("Like", "Upsert")
        } else {
            setVote("Like")
            setLikes(likes + 1)
            await updateBackend("Like", "Upsert")
        } 
    }

    const onClickDislike = async(event: MouseEvent<SVGSVGElement>) => {
        event.stopPropagation()

        // If the user has not logged in, prompt them to do so
        if (!authenticated) {
            dispatch(clickedLogin())
            return
        }
        
        if (currentVote == "Dislike") {
            setVote("")
            setDislikes(dislikes - 1)
            await updateBackend("Dislike", "Delete")

        } else if (currentVote == "Like"){
            setVote("Dislike")
            setDislikes(dislikes + 1)
            setLikes(likes - 1)
            await updateBackend("Dislike", "Upsert")

        } else {
            setVote("Dislike")
            setDislikes(dislikes + 1)
            await updateBackend("Dislike", "Upsert")
        }
    }

    const [upsertPostVote, {}] = useUpsertPostVoteMutation()
    const [upsertCommentVote, {}] = useUpsertCommentVoteMutation()
    const [deletePostVote, {}] = useDeletePostVoteMutation()
    const [deleteCommentVote, {}] = useDeleteCommentVoteMutation()
    const updateBackend = async(vote: "Like" | "Dislike", action: "Upsert" | "Delete") => {
        try {
            if (checkIsPost(submission)) {
                if (action == "Upsert") {
                    await upsertPostVote({postId: submission.id, vote: vote}).unwrap()
                } else {
                    await deletePostVote(submission.id).unwrap()
                }
            } else {
                if (action == "Upsert") {
                    await upsertCommentVote({commentId: submission.id, vote: vote}).unwrap()
                } else {
                    await deleteCommentVote(submission.id).unwrap()
                }
            }
        } catch (err: any) {
            defaultFetchErrorHandler(err, dispatch)
        }
    }
            

    return (
        <Box sx={{display: "flex", flexDirection: "row", gap: "25px"}}>
            <Box sx={{display: "flex", flexDirection: "row", gap: "5px", cursor: 'pointer'}}>
                <Typography variant="body2">{likes}</Typography>
                {currentVote == "Like" ? <ThumbUpAltIcon id="like" onClick={onClickLike}/> : <ThumbUpOffAltIcon id="like" onClick={onClickLike}/>}
            </Box>
            <Box sx={{display: "flex", flexDirection: "row", gap: "5px", cursor: 'pointer'}}>
                <Typography variant="body2">{dislikes}</Typography>
                {currentVote == "Dislike" ? <ThumbDownAltIcon id="dislike" onClick={onClickDislike}/> : <ThumbDownOffAltIcon id="dislike" onClick={onClickDislike}/>}
            </Box>       
        </Box>
    )
}