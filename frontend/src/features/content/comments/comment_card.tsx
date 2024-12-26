import { Box, Typography } from "@mui/material"
import { VoteBox } from "../vote_box"
import ReplyIcon from '@mui/icons-material/Reply';
import { ParentCommentCard } from "./parent_comment";
import { Dispatch, FC, SetStateAction, useContext } from "react";
import { formatDate } from "../utils";
import { MarkdownBody } from "../custom_components";
import { useRouter } from "next/router";
import { PostContext, scrollToParamName } from "../posts/post";
import { menuOption, OnClickMenu } from "../onclick_menu";
import { PopUpContext } from "@/features/popups/popup_context";
import { useDispatch } from "react-redux";
import { clickedDelete } from "@/features/popups/popup_slice";
import { useDeleteCommentMutation } from "./api_slice";
import { Comment } from "./comment_types";
import { getUser } from "@/features/auth/auth";

interface coreProps {
    comment: Comment
    menuOptions: menuOption[]
}

const CommentCardCore: FC<coreProps> = ({comment, menuOptions}) =>  {

    const createdAt = formatDate(new Date(comment.createdAt))
    const edited = comment.createdAt != comment.updatedAt
    return (

        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
            <Box>
                <Box sx={{display: "flex"}}>
                    <Typography variant="body2" fontWeight={"bold"}>{`${comment.author} `}</Typography>
                    <Typography variant="body2" color="grey">{`, ${createdAt}${edited ? " (Edited)" : ""}`}</Typography>
                </Box>
                {comment.parentComment ? <ParentCommentCard {...comment.parentComment}/> : <></>}
                {comment.status == "Deleted"
                    ? <Typography variant="body2" color="grey">{"[Deleted]"}</Typography>  
                    : <MarkdownBody>{comment.body}</MarkdownBody>
                }                         
            </Box>   
            {comment.author != getUser() || comment.status == "Deleted"
                ? <></>
                : <OnClickMenu options={menuOptions}/>            
            }
        </Box>        
    )
}

export const CommentCardUnderPost = (comment: Comment) => {
    const {setDeleteQueryFunc} = useContext(PopUpContext)
    const {setReplyTo, setCommentToEdit} = useContext(PostContext)
    const dispatch = useDispatch()

    const [deleteComment, {isLoading}] = useDeleteCommentMutation()
    const menuOptions = [
        {
            label: "Edit",
            onClick: () => {
                if (setCommentToEdit) {
                    setCommentToEdit(comment)
                }
            }
        },
        {
            label: "Delete",
            onClick: () => {                
                if (setDeleteQueryFunc) {
                    setDeleteQueryFunc(() => deleteComment)
                }                
                dispatch(clickedDelete({isDeleting: isLoading, resourceId: comment.id}))
            }
        }
    ]

    return (
        <Box id={comment.id} sx={{display: "flex", flexDirection: "column", gap: "5px", border: 1.7, borderRadius:10, borderColor: "#d3d3d3", py: 1, px: 5}}>
            <CommentCardCore comment={comment} menuOptions={menuOptions}/>   
            <Box sx={{display: "flex", flexDirection: "row", gap: "25px"}}>
                <VoteBox {...comment}/>
                <Box onClick={() => {if (setReplyTo) setReplyTo(comment)}} sx={{display: "flex", flexDirection: "row", gap: "5px",cursor: 'pointer'}}>
                    <Typography variant="body2" fontWeight={"bold"}>Reply</Typography>
                    <ReplyIcon/>
                </Box>
            </Box>
        </Box>
    )
}

export const CommentCardInListing = (comment: Comment) => {
    const {setDeleteQueryFunc} = useContext(PopUpContext)
    const dispatch = useDispatch()

    const [deleteComment, {isLoading}] = useDeleteCommentMutation()
    const router = useRouter()

    const menuOptions = [
        {
            label: "Edit",
            onClick: () => {}
        },
        {
            label: "Delete",
            onClick: () => {                
                if (setDeleteQueryFunc) {
                    setDeleteQueryFunc(() => deleteComment)
                }                
                dispatch(clickedDelete({isDeleting: isLoading, resourceId: comment.id}))
            }
        }
    ]

    return (
        <Box id={comment.id} 
             sx={{display: "flex", flexDirection: "column", gap: "5px", border: 1.7, borderRadius:10, borderColor: "#d3d3d3", py: 1, px: 5}}
             onClick={() => router.push(`posts/${comment.postId}?${scrollToParamName}=${comment.id}`)}             
        >
            <CommentCardCore comment={comment} menuOptions={menuOptions}/>
            <Box sx={{display: "flex", flexDirection: "row", gap: "25px"}}>
                <VoteBox {...comment}/>
            </Box>
        </Box>
    )
}