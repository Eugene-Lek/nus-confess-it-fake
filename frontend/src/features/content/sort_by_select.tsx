import { useAppDispatch } from "@/redux/hooks"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { sortByUpdated } from "../topbar/filter_slice"


export const SortBySelect = () => {
    const dispatch = useAppDispatch()

    return (
        <FormControl>
            <InputLabel id="sortBy">Sort By</InputLabel>
            <Select
                labelId="sortBy"
                label="Sort by"
                size="small"
                sx={{width: "200px"}}
                defaultValue="Newest"
                onChange={(e) => dispatch(sortByUpdated(e.target.value))}
            >
                <MenuItem value={"Newest"}>Newest</MenuItem>
                <MenuItem value={"Relevance"}>Relevance</MenuItem>
                <MenuItem value={"Popular"}>Popular</MenuItem>
            </Select>
        </FormControl>
    )
}