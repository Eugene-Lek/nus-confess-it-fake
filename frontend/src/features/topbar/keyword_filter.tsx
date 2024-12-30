import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, TextField } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { queryUpdated } from "./filter_slice";
import styles from "./topbar.module.css"

export const KeywordFilter: FC = () => {
    const dispatch = useAppDispatch()
    const initKeywords = useAppSelector((state) => state.filter.query)
    const [keywords, setKeywords] = useState(initKeywords)
    useEffect(() => {setKeywords(initKeywords)}, [initKeywords])

    const onSubmit = (e: any) => {
        e.preventDefault()
        dispatch(queryUpdated(keywords))
    }

    const hide = useAppSelector((state) => state.filter.hideQueryFilter)
    return (
        <form onSubmit={onSubmit} style={{visibility: hide ? "hidden": "visible", display: "flex"}} >
            <TextField 
                value={keywords}
                label="Search by keyword(s)" 
                variant="outlined" 
                size="small" 
                rows={1}
                className={styles["filter"]}
                onChange={(e) => {setKeywords(e.target.value)}}
                onBlur={onSubmit}/>
            {/*Icon button must be wrapped with a box so that the 'search-icon' class overrides
               the default "display" of icon button */}
            <Box className={styles["search-icon"]}>
                <IconButton type="submit" aria-label="search" onClick={onSubmit}>
                    <SearchIcon style={{ fill: "#8D99AE" }} />
                </IconButton>
            </Box>
        </form>

    )
}