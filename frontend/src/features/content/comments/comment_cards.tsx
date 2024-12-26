import { Box, CircularProgress, SxProps, Theme } from "@mui/material"
import { Comment } from "./comment_types"
import { CommentCardUnderPost, CommentCardInListing } from "./comment_card"
import { Dispatch, FC, SetStateAction, useEffect } from "react"
import { SortBySelect } from "../sort_by_select"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { filterCleared, hideTagFilter, showTagFilter } from "@/features/topbar/filter_slice"
import { userIsLoggedIn } from "@/features/auth/auth"
import { clickedLogin } from "@/features/popups/popup_slice"
import { defaultFetchErrorHandler } from "@/redux/api"
import { TypedUseQuery } from "@reduxjs/toolkit/query/react"

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
}

export const CommentCardsInListing: FC<props2> = ({apiQueryHook, extraProps}) => {
    const dispatch = useAppDispatch()

    // When the user navigates to another page (i.e. when the component dismounts),
    // clear the filters and show the tag filter again
    useEffect(() => {
        return () => {
            dispatch(filterCleared())
            dispatch(showTagFilter())
        }
    }, [])

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
        query: useAppSelector(state => state.filter.query),
        sortBy: useAppSelector(state => state.filter.sortBy),
        ...extraProps
    }
    var {data: comments, isLoading, error} = apiQueryHook(getCommentsProps)
    defaultFetchErrorHandler(error, dispatch)

    return (
        <>
            <SortBySelect/>
            {isLoading
                ? <CircularProgress sx={{marginTop: "25px"}} size="35px"/>  
                : <></>
            }
            <Box sx={{display: "flex", flexDirection: "column", gap: "15px", px:"40px", paddingTop: "30px", paddingBottom:"200px"}}>
                {comments?.map((comment) => <CommentCardInListing key={comment.id} {...comment}></CommentCardInListing>)}
            </Box>
        </>
    )
}