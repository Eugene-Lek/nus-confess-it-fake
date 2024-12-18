import { Autocomplete, Box, IconButton, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FC } from "react";

export const KeywordFilter: FC = () => {
    // TODO:
    // On change, update filter state
    // On click search, make API call

    return (
        <Box>
            <TextField 
                id="outlined-basic" 
                label="Search by keyword(s)" 
                variant="outlined" 
                size="small" 
                rows={1}
                sx={{width: {sm: "150px", md: "200px", lg: "300px"}}}/>
            <IconButton type="submit" aria-label="search">
                <SearchIcon style={{ fill: "#8D99AE" }} />
            </IconButton>
        </Box>

    )
}