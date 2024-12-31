import { Comment } from "../comments/comment_types";
import { Box, Divider, Typography } from "@mui/material";
import { VoteBox } from "../vote_box";
import { useEffect, useRef, useState, createContext, Dispatch, SetStateAction, RefObject } from "react";
import { MarkdownBody} from "../custom_components";
import { CommentEditor } from "../comments/comment_editor";
import { CommentCardsUnderPost } from "../comments/comment_cards";
import { formatDate } from "../utils";
import { useGetCommentsByPostIdQuery } from "../comments/api_slice";
import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";
import { useSearchParams } from "next/navigation";
import { PostEditDeleteMenu } from "./post_edit_delete_menu";
import { Post } from "./post_types";
import { hideBothFilters, showBothFilters } from "@/features/topbar/filter_slice";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from "next/router";
import styles from "../content.module.css"

export const scrollToParamName = "scrollTo"

interface props {
    postId: string
    replyTo: Comment | null
    setReplyTo: Dispatch<SetStateAction<Comment | null>> | null
    commentToEdit: Comment | null
    setCommentToEdit: Dispatch<SetStateAction<Comment | null>> | null 
    scrollToRef: RefObject<string> | null
}

export const PostContext = createContext<props>({
    postId: "",
    replyTo: null, 
    setReplyTo : null, 
    commentToEdit: null, 
    setCommentToEdit: null,
    scrollToRef: null
})

export const PostComponent = (post: Post) => {
    const dispatch = useAppDispatch()

    // Hide the keywords and tag filter in the top bar since they are irrelevant
    dispatch(hideBothFilters())    

    // When the user navigates to another page (i.e. when the component dismounts),
    // show both filters again
    useEffect(() => {
        return () => {
            dispatch(showBothFilters())
        }
    }, [])    

    const {data: comments, isLoading, error} = useGetCommentsByPostIdQuery(post.id)
    defaultFetchErrorHandler(error, dispatch)

    const scrollTo = useSearchParams().get(scrollToParamName)
    const scrollToRef = useRef(scrollTo || "") // Controls which element to scroll to upon comment update (if any)
    useEffect(() => {
        if (!comments) {
            // If the comments have not been loaded yet, do not execute any scroll
            return
        }

        if (scrollToRef.current) {
            // Scroll to a particular comment in the post if indicated in the url
            document.getElementById(scrollToRef.current)?.scrollIntoView({behavior: "smooth", block: "center"})

            // clear the ref after the scroll has been executed
            scrollToRef.current = "" 
        }

    }, [comments])

    // Create a local state to keep track of the comment to reply to and comment to edit (if any)
    // useState is used instead of redux since this information is only required by this component
    const [replyTo, setReplyTo] = useState<Comment | null>(null)
    const [commentToEdit, setCommentToEdit] = useState<Comment | null>(null)

    // Back button
    const router = useRouter()
    const onClickBack = () => {
        router.back()
    }    

    const createdAt = formatDate(new Date(post.createdAt))
    const edited = post.createdAt != post.updatedAt

    return (
        <PostContext.Provider value={{postId: post.id, replyTo, setReplyTo, commentToEdit, setCommentToEdit, scrollToRef}}>
            <Box className={styles["post-page"]}>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <ArrowBackIcon onClick={onClickBack} sx={{cursor: "pointer"}}/>
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                        <Box>
                                {post.status == "Deleted"
                                    ? <Typography variant="h6" color="grey" fontWeight={"bold"}>{"[Deleted]"}</Typography>  
                                    : <Typography variant="h6" fontWeight={"bold"}>{post.title}</Typography>
                                } 
                            <Box sx={{display: "flex"}}>
                                <Typography variant="body2">{`${post.author}`}</Typography>
                                <Typography variant="body2" color="grey">{`, ${createdAt}${edited ? " (Edited)" : ""}`}</Typography>
                            </Box>
                        </Box>
                        <PostEditDeleteMenu {...post}/>
                    </Box>
                    <Box sx={{display: "flex", gap:"20px"}}>
                    {post.tags.map((tag) => (
                                <Box key={tag} sx={{border: 1, borderRadius:10, borderColor:"#F2F3F3", boxShadow: 1, px: 2, backgroundColor: "#F2F3F3"}}>
                                    <Typography key={tag} variant="body2">{tag}</Typography>
                                </Box>
                        ))}
                    </Box>
                </Box>
                <MarkdownBody>{post.body}</MarkdownBody>
                <VoteBox {...post}/>
                <Divider/>
                <CommentCardsUnderPost comments={comments ? comments : Array(0)} isLoading={isLoading}/>
            </Box>
            <CommentEditor/>
        </PostContext.Provider>
    )
}