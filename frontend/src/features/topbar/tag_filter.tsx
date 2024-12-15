import { Autocomplete, TextField } from "@mui/material";
import { FC } from "react";

export const TagFilter: FC = () => {

    // Get options from redux store
    let options = ["Math", "CS", "Campus", "Hall", "CCAs"]

    return (
        <Autocomplete 
            multiple 
            options={options} 
            renderInput={(params) => <TextField {...params} label="Search by tag(s)" size="small" rows={1}/>}
            sx={{width: {sm: "150px", md: "200px", lg: "300px"}}}>

        </Autocomplete>
    )
}