import { userIsLoggedIn } from "@/features/auth/auth"
import { clickedLogin } from "@/features/popups/popup_slice"
import { filterCleared, hideTagFilter, showTagFilter } from "@/features/topbar/filter_slice"
import { defaultFetchErrorHandler } from "@/redux/api"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { Box, CircularProgress, Typography } from "@mui/material"
import { TypedUseQuery } from "@reduxjs/toolkit/query/react"
import { FC, useEffect } from "react"
import { SortBySelect } from "../sort_by_select"
import { CommentCardInListing, CommentCardUnderPost } from "./comment_card"
import { Comment } from "./comment_types"
import styles from "../content.module.css"

interface props1 {
    comments: Comment[]
    isLoading: boolean
}

export const CommentCardsUnderPost: FC<props1> = ({comments, isLoading}) => {
    return (
        <>
            {isLoading
                ? <CircularProgress sx={{marginTop: "25px"}}/>  
                : <Box sx={{display: "flex", flexDirection: "column", gap: "15px"}}>
                    {comments.map((comment) => <CommentCardUnderPost key={comment.id} {...comment}></CommentCardUnderPost>)}
                  </Box>
            }
        </>
    )
}

interface props2 {
    apiQueryHook: TypedUseQuery<Comment[], any, any>
    extraProps?: {
        author?: string
        likedBy?: string
    }
    title: string
}

export const CommentCardsInListing: FC<props2> = ({apiQueryHook, extraProps, title}) => {
    const dispatch = useAppDispatch()
    const query = useAppSelector(state => state.filter.query)
    const sortBy = useAppSelector(state => state.filter.sortBy)

    // When the user navigates to another page (i.e. when the component dismounts),
    // clear the filters and show the tag filter again
    useEffect(() => {
        return () => {
            dispatch(filterCleared())
            dispatch(showTagFilter())
        }
    })

    // Hide the tag filter in the top bar since it is irrelevant
    dispatch(hideTagFilter())

    // Direct the user to login if they have not done so
    const authenticated = userIsLoggedIn()
    if (!authenticated) {
        dispatch(clickedLogin())
        return <></>
    }

    // Fetch the posts
    const getCommentsProps = {
        query: query,
        sortBy: sortBy,
        ...extraProps
    }
    const {data: comments, isLoading, error} = apiQueryHook(getCommentsProps)
    defaultFetchErrorHandler(error, dispatch)

    return (
        <Box className={`maximise-width ${styles["posts-comments-page"]}`}>
            <Typography variant="h5" fontWeight={"bold"}>{title}</Typography>             
            <Box sx={{display: "flex", gap: "25px"}}>
                <SortBySelect/>
                {isLoading
                    ? <CircularProgress size="35px"/>  
                    : <></>
                }
            </Box>
            {!comments
                ? <></>
                : comments.length == 0
                ? <Typography variant="body1">No comments match the selected filters</Typography>
                : <Box sx={{display: "flex", flexDirection: "column", gap: "15px"}}>
                    {comments?.map((comment) => <CommentCardInListing key={comment.id} {...comment}></CommentCardInListing>)}
                  </Box>
            }
        </Box>        
    )
}