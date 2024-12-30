/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Autocomplete, Box, TextField } from "@mui/material";
import { FC } from "react";
import { useGetTagsQuery } from "../content/posts/api_slice";
import { tagsUpdated } from "./filter_slice";
import styles from "./topbar.module.css"

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
                                        <Box className={styles["selected-tags"]}>
                                        {startAdornment}
                                        </Box>
                                    ),
                                },
                            }}
                            />
                        );
                    }
                    }
                sx={{ visibility: hide ? "hidden": "visible"}}
                className={styles["filter"]}
                onChange={(e, newValue) => dispatch(tagsUpdated(newValue))}
                />
    )
}