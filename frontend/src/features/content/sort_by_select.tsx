import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"


export const SortBySelect = () => {
    return (
        <FormControl sx={{marginTop: "25px", mx: "40px"}}>
            <InputLabel id="sortBy">Sort By</InputLabel>
            <Select
                labelId="sortBy"
                label="Sort by"
                size="small"
                sx={{width: "200px"}}
                defaultValue="newest"
                //onChange={handleChange}
            >
                <MenuItem value={"newest"}>Newest</MenuItem>
                <MenuItem value={"relevance"}>Relevance</MenuItem>
                <MenuItem value={"popular"}>Popular</MenuItem>
            </Select>
        </FormControl>
    )
}