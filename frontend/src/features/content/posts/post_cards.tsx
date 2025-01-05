import { filterCleared } from "@/features/topbar/filter_slice"
import { defaultFetchErrorHandler } from "@/redux/api"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { Box, CircularProgress, Typography } from "@mui/material"
import { TypedUseQuery } from "@reduxjs/toolkit/query/react"
import { FC, useEffect } from "react"
import { SortBySelect } from "../sort_by_select"
import { PostCard } from "./post_card"
import { Post } from "./post_types"
import styles from "../content.module.css"

interface props {
    apiQueryHook: TypedUseQuery<Post[], any, any>
    extraProps?: {
        author?: string
        likedBy?: string
    }
    title: string
}

export const PostCards: FC<props> = ({apiQueryHook, extraProps, title}) => {
    const dispatch = useAppDispatch()

    // When the user navigates to another page (i.e. when the component dismounts),
    // clear the filters
    useEffect(() => {
        return () => { dispatch(filterCleared()) }
    }, [])

    // Fetch the posts
    const getPostsProps = {
        query: useAppSelector(state => state.filter.query),
        tags: useAppSelector(state => state.filter.tags),
        sortBy: useAppSelector(state => state.filter.sortBy),
        ...extraProps
    }
    const {data: posts, isLoading, error} = apiQueryHook(getPostsProps)
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
            {!posts
                ? <></>
                : posts.length == 0
                ? <Typography variant="body1">No posts match the selected filters</Typography>
                : <Box sx={{display: "flex", flexDirection: "column", gap: "30px"}}>
                        {posts?.map((post) => <PostCard key={post.id} {...post}></PostCard>)}
                  </Box>
            }
        </Box>
    )

}