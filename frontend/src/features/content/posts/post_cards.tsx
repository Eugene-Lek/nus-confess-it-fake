import { filterCleared } from "@/features/topbar/filter_slice"
import { defaultFetchErrorHandler } from "@/redux/api"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { Box, CircularProgress, Typography } from "@mui/material"
import { TypedUseQuery } from "@reduxjs/toolkit/query/react"
import { FC, useEffect } from "react"
import { SortBySelect } from "../sort_by_select"
import { PostCard } from "./post_card"
import { Post } from "./post_types"

interface props {
    apiQueryHook: TypedUseQuery<Post[], any, any>
    extraProps?: {
        author?: string
        likedBy?: string
    }
}

export const PostCards: FC<props> = ({apiQueryHook, extraProps}) => {
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
        <Box sx={{px:"40px", paddingTop: "25px", paddingBottom:"200px", display: "flex", flexDirection:"column", gap: "30px"}}>
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