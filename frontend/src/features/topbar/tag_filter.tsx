import { Autocomplete, TextField } from "@mui/material";
import { FC } from "react";
import { useGetTagsQuery } from "../content/posts/api_slice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { tagsUpdated } from "./filter_slice";

export const TagFilter: FC = () => {
    const dispatch = useAppDispatch()
    const {data: tags} = useGetTagsQuery()

    const selectedTags = useAppSelector((state) => state.filter.tags)
    const hide = useAppSelector((state) => state.filter.hideTagFilter)

    return (
        <Autocomplete 
            value={selectedTags}
            multiple 
            options={tags || Array(0)} 
            renderInput={(params) => <TextField {...params} label="Search by tag(s)" size="small" rows={1}/>}
            sx={{visibility: hide ? "hidden": "visible", width: {sm: "150px", md: "200px", lg: "300px"}}}
            onChange={(e, newValue) => dispatch(tagsUpdated(newValue))}
            />
    )
}