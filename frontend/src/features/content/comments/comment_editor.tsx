import { userIsLoggedIn } from "@/features/auth/auth";
import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch, } from "@/redux/hooks";
import { Cancel } from "@mui/icons-material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { Box, CircularProgress, Typography } from "@mui/material";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { clickedLogin } from "../../popups/popup_slice";
import { Textarea } from "../custom_components";
import { PostContext } from "../posts/post";
import { convertToMarkdown } from "../utils";
import { useCreateCommentMutation, useUpdateCommentMutation } from "./api_slice";
import { NewComment } from "./comment_types";
import { ParentCommentCard } from "./parent_comment";
import styles from "../content.module.css"

export const CommentEditor = () => {
    // Fetch the post's context
    const {postId, replyTo, setReplyTo, commentToEdit, setCommentToEdit, scrollToRef} = useContext(PostContext)

    // Make the comment text field a controlled component so that the user's draft comment
    // can be cleared upon submission
    const init = commentToEdit?.body || ""
    const [draft, setDraft] = useState(init)

    // useState only uses the init value for the 1st render, 
    // so useEffect is used to update draft whenever the comment to edit changes
    useEffect(() => { setDraft(init)}, [init] )

    // Prevent the user from drafting a comment unless they have logged in
    const authenticated = userIsLoggedIn()
    const dispatch = useAppDispatch()
    const onClick = (e: MouseEvent<HTMLTextAreaElement> ) => {
        // Check if the user has logged in. If not, prompt them to log in.
        if (!authenticated) {
            dispatch(clickedLogin())
            const ele = e.target as HTMLTextAreaElement
            ele.blur()
            return
        }
    }
    
    // Handle comment submission
    const [createComment, { isLoading: isCreatingComment }] = useCreateCommentMutation()
    const [updateComment, { isLoading: isUpdatingComment }] = useUpdateCommentMutation()
    const onSubmit = async() => {     
        if (!draft.trim()) {
            return
        }
        const editComment = commentToEdit?.id // commentToEdit.id exists, that implies we are editing an existing comment
        const newComment: NewComment = {
            id: editComment || uuidv4(),
            postId: postId,
            body: convertToMarkdown(draft),
            parentId: replyTo?.id || "",
            parentAuthor: replyTo?.author || "",
            parentBody: replyTo?.body || "",
        }
        try {
            if (editComment) {
                await updateComment(newComment).unwrap()
            } else {
                await createComment(newComment).unwrap()
            }
        } catch(err) {
            defaultFetchErrorHandler(err, dispatch)
        }

        setDraft("")
        if (setReplyTo && setCommentToEdit && scrollToRef) {
            setReplyTo(null)
            setCommentToEdit(null)
            scrollToRef.current = newComment.id // Scroll to the new comment            
        }
    }

    const onClickBack = () => {
        if (setCommentToEdit) {
            setCommentToEdit(null)
        }
    }

    const editComment = commentToEdit?.id // If commentToEdit.id exists, that implies we are editing an existing comment
    if (editComment && commentToEdit.parentComment) {
        // If we are editing a comment and the comment has a parent, set the reply to state to it
        if (setReplyTo) {
            setReplyTo(commentToEdit.parentComment)
        }
    }
    
    return (
        <Box position="fixed" className={styles["comment-editor"]}>
            <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                {editComment
                        ? <Box sx={{display: "flex", gap: "10px"}}>
                            <ArrowBackIcon onClick={onClickBack} fontSize="small" sx={{cursor: "pointer"}}/>
                            <Typography variant="body2" color="grey" sx={{marginBottom: 1}}>Edit Comment:</Typography>
                          </Box> 
                        : <></>
                }                
                {replyTo 
                ? <Box sx={{display: "flex", alignItems:"flex-start"}}>
                        <Box sx={{width:"100%"}}>
                            {/*ParentCommentCard must be wrapped in a box with 100% width so that
                            it will always expand to the maximum length*/}
                            <ParentCommentCard {...replyTo}/>
                        </Box>
                        <Cancel sx={{my:1, cursor:"pointer"}} onClick={() => {if (setReplyTo) setReplyTo(null)}}/> 
                </Box>    
                : <></>}                    
                <Textarea
                    maxRows={4} 
                    placeholder={"Add a comment"} 
                    value={draft} 
                    onChange={(e) => {setDraft(e.target.value)}} 
                    onClick={onClick}
                    disabled={isCreatingComment || isUpdatingComment}
                    maxLength={10000}/>
            </Box>
            { !authenticated
                ? <></>
                : isCreatingComment
                ? <CircularProgress size="25px" />
                :  draft.trim()
                ? <SendIcon onClick={onSubmit} sx={{cursor: "pointer"}}/>
                : <SendIcon onClick={onSubmit} sx={{cursor: "default", color: "grey"}}/>
            }
        </Box>
    )
}