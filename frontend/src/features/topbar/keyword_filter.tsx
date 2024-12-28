import { Autocomplete, Box, FormControl, FormGroup, IconButton, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FC,  FormEvent,  useEffect,  useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { queryUpdated } from "./filter_slice";

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
        <form onSubmit={onSubmit} style={{visibility: hide ? "hidden": "visible"}} >
            <TextField 
                value={keywords}
                label="Search by keyword(s)" 
                variant="outlined" 
                size="small" 
                rows={1}
                sx={{width: {xs: "175px", sm: "225px", md: "250px", lg: "300px"}}}
                onChange={(e) => {setKeywords(e.target.value)}}
                onBlur={onSubmit}/>
            <IconButton type="submit" aria-label="search" onClick={onSubmit}>
                <SearchIcon style={{ fill: "#8D99AE" }} />
            </IconButton>
        </form>

    )
}