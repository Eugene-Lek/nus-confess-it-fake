/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Autocomplete, Box, TextField } from "@mui/material";
import { FC } from "react";
import { useGetTagsQuery } from "../content/posts/api_slice";
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
                renderInput={(params) => {
                        const { InputProps, size, ...restParams } = params;
                        const { startAdornment, ...restInputProps } = InputProps;
                        return (
                            <TextField
                            label="Search by tag(s)" 
                            rows={1}  
                            size={"small"}
                            { ...restParams }
                            slotProps={{
                                input: {
                                    sx: {display: "flex", overflowX: "auto"},
                                    ...restInputProps,
                                    startAdornment: (
                                        <Box sx={{
                                            display: "flex", // Make the selected options flex row-wise
                                            overflowX: 'auto', 
                                            maxWidth: {xs: "60px", sm: "115px", md: "135px", lg: "185px"}, // Restrict the width of the selected tags to leave room for the free text box
                                            scrollbarWidth: "thin"
                                        }}
                                        >
                                        {startAdornment}
                                        </Box>
                                    ),
                                },
                            }}
                            />
                        );
                    }
                    }
                sx={{
                    visibility: hide ? "hidden": "visible", 
                    width: {xs: "175px", sm: "225px", md: "250px", lg: "300px"},
                    my: 1
                }}
                onChange={(e, newValue) => dispatch(tagsUpdated(newValue))}
                />
    )
}