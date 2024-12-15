import { Box, CircularProgress } from "@mui/material"
import SendIcon from '@mui/icons-material/Send';
import { Cancel } from "@mui/icons-material"
import { ParentCommentCard } from "./parent_comment"
import { formatDate, Textarea } from "./utils"
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clickedLogin } from "../popups/popup_slice";
import { Dispatch, FC, MouseEvent, SetStateAction, useState } from "react";
import { Comment } from "./comment_card";

interface props {
    replyTo: Comment | undefined
    setReplyTo: Dispatch<SetStateAction<Comment | undefined>>
    comments: Comment[]
    setComments: Dispatch<SetStateAction<Comment[]>>
    scrollToBottom: () => void
}

export const AddComment: FC<props> = ({replyTo, setReplyTo, comments, setComments, scrollToBottom}) => {
    // Make the comment text field a controlled component so that the user's draft comment
    // can be cleared upon submission
    const [draft, setDraft] = useState("")

    // Prevent the user from drafting a comment unless they have logged in
    const authenticated = useAppSelector((state) => state.session.authenticated)
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
    const username = useAppSelector((state) => state.session.username)
    const [loading, setLoading] = useState(false) 
    const onSubmit = async() => {
        setLoading(true)

        const newComment: Comment = {
            id: crypto.randomUUID(),
            author: username,
            body: draft,
            likes: 0,
            dislikes: 0,
            createdAt: formatDate(new Date()),
            updatedAt: "",
            parentId: replyTo ? replyTo.id : "",
            parentAuthor: replyTo ? replyTo.author : "",
            parentBody: replyTo ? replyTo.body : "",
        }
        
        // Make HTTP call to create comment
        await new Promise(r => setTimeout(r, 2000));

        setComments([...comments, newComment])
        setDraft("")
        setReplyTo(undefined)
        setLoading(false)
        scrollToBottom()
    }

    return (
        <Box position="fixed" sx={{ display: "flex", alignItems:"flex-end", gap:"5px", top: 'auto', bottom: 0,  width: "calc(100% - 270px)", bgcolor: "#FFFFFF", boxShadow:2, py: 1, px: 1, borderRadius: 2}}>
            <Box sx={{display: "flex", flexDirection: "column", width: "100%"}}>
                {replyTo 
                ? <Box sx={{display: "flex", alignItems:"flex-start", gap:"5px"}}>
                        <Box sx={{width:"100%"}}>
                            {/*ParentCommentCard must be wrapped in a box with 100% width so that
                            it will always expand to the maximum length*/}
                            <ParentCommentCard {...replyTo}/>
                        </Box>
                        <Cancel sx={{my:1, cursor:"pointer"}} onClick={() => {setReplyTo(undefined)}}/> 
                </Box>    
                : <></>}
                <Textarea
                    maxRows={4} 
                    placeholder={"Add a comment"} 
                    value={draft} 
                    onChange={(e) => {setDraft(e.target.value)}} 
                    onClick={onClick}
                    disabled={loading} />
            </Box>
            { !authenticated
                ? <></>
                : loading
                ? <CircularProgress size="25px" />
                : <SendIcon onClick={onSubmit} sx={{cursor: "pointer"}}/>
            }
        </Box>
    )
}