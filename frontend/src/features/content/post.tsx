import { Comment, CommentCard } from "./comment_card";
import { Box, CircularProgress, Divider, TextField, Typography } from "@mui/material";
import { VoteBox } from "./vote_box";
import { MouseEvent, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { formatDate, Textarea } from "./utils";
import { clickedLogin } from "../popups/popup_slice";
import { AddComment } from "./add_comment";

export interface Post {
    id: string,
    title: string,
    body: string,
    tags: string[],
    likes: number,
    dislikes: number,
    author: string,
    createdAt: string,
    updatedAt: string
}

const data: Comment[] = [
    {id: "1", body: `stayed at PH. might be a social skill issue but i found it tough to interact with my house mates. people who speak the same language and from the same country stick together. it was tough for me to break through any cliques. i even went to plan and tank some community projects there, end up no friends and 100% resentment.\n\ni really tried but maybe it's just me ah.\n\nthe few locals are ghosts too and have their own life outside the House. so my social life revolved around the 4 walls and i ended up staying at my BF's place, giving up the room at the end of the sem. definitely not what i expect since i thought campus' life is more vibrant. it was a pity`, likes: 10, dislikes: 2, author:"tom", parentAuthor:"", parentBody:"", parentId:"", createdAt: "11/11/12, 12:24", updatedAt: ""},
    {id: "2", parentId: "1", body:`\n\nstayed at lh, same here. found it very hard to connect with peers, everyone already knows others and it's hard to fit in. kitchen was shared with 2 blocks and was always dirty\n\nalso ended up staying at home as i like to cook my own meals and overall, felt very isolated in dorms`, likes: 13, dislikes: 4, author:"jerry", parentAuthor:"tom", parentBody:"stayed at PH. might be a social skill issue but i found it tough to interact with my house mates. people who speak the same language and from the same country stick together. it was tough for me to break through any cliques. i even went to plan and tank some community projects there, end up no friends and 100% resentment.\n\ni really tried but maybe it's just me ah.\n\nthe few locals are ghosts too and have their own life outside the House. so my social life revolved around the 4 walls and i ended up staying at my BF's place, giving up the room at the end of the sem. definitely not what i expect since i thought campus' life is more vibrant. it was a pity", createdAt: "11/11/12, 12:24", updatedAt: ""},
    {id: "3", body: `Personal take: is just pgp’s try-hard attempt to be a hall because that was the one place you can just stay and sleep w/o any extra curricular activities, but it will never actually come close.\n\nStayed in PGPR way (and subsequently stayed in another hall) before they even had this idea of houses. Personally hated the experience.`, likes: 2, dislikes: 2, author:"spike", parentAuthor:"", parentBody:"", parentId:"", createdAt: "11/11/12, 12:24", updatedAt: ""},
    {id: "4", parentId: "3", body:`you choose pgpr with the intent of wanting rich culture, hall activities, never get that, then you sad? lmao?`, likes: 0, dislikes: 2, author:"nibbles", parentAuthor:"spike", parentBody:"Personal take: is just pgp’s try-hard attempt to be a hall because that was the one place you can just stay and sleep w/o any extra curricular activities, but it will never actually come close.\n\nStayed in PGPR way (and subsequently stayed in another hall) before they even had this idea of houses. Personally hated the experience.", createdAt: "11/11/12, 12:24", updatedAt: ""},
    {id: "5", parentId: "", body:`Short comment test`, likes: 0, dislikes: 2, author:"nibbles", parentAuthor:"", parentBody:"", createdAt: "11/11/12, 12:24", updatedAt: ""},
]

export const Post = (post: Post) => {
    // TODO
    // Get the comments from redux store/API (useEffect)
    const [comments, setComments] = useState(data)

    //TODO
    // Display loading widget while comments are being fetched

    // Create a local state to keep track of the comment to reply to (if any)
    // useState is used instead of redux since this information is only required by this component
    const [replyTo, setReplyTo] = useState<Comment | undefined>(undefined)

    // Logic to make the screen automatically scroll to the bottom
    // whenever the user submits a new comment
    const lastCommentRef = useRef<null | HTMLDivElement>(null)
    const scrollToBottom = () => {
      lastCommentRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <>
            <Box sx={{display: "flex", flexDirection: "column", gap: "15px", px:"40px", paddingTop: "30px", paddingBottom:"200px"}}>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <Typography variant="h6" fontWeight={"bold"}>{post.title}</Typography>
                    <Box sx={{display: "flex"}}>
                        <Typography variant="body2">{`${post.author}`}</Typography>
                        <Typography variant="body2" color="grey">{`, ${formatDate(new Date(post.createdAt))}`}</Typography>
                    </Box>
                    <Box sx={{display: "flex", gap:"20px"}}>
                    {post.tags.map((tag) => (
                                <Box key={tag} sx={{border: 1, borderRadius:10, borderColor:"#F2F3F3", boxShadow: 1, px: 2, backgroundColor: "#F2F3F3"}}>
                                    <Typography key={tag} variant="body2">{tag}</Typography>
                                </Box>
                        ))}
                    </Box>
                </Box>
                <Typography variant="body2">{post.body}</Typography>            
                <VoteBox {...post}/>
                <Divider/>
                {comments.map(comment => (
                    <CommentCard comment={comment} setReplyTo={setReplyTo}/>
                ))}
                <Box ref={lastCommentRef}/>
            </Box>
            <AddComment 
                replyTo={replyTo} 
                setReplyTo={setReplyTo}
                comments={comments}
                setComments={setComments}
                scrollToBottom={scrollToBottom}/>
        </>
    )
}