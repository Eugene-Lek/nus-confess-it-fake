import { Box, Toolbar } from "@mui/material"
import { FC, PropsWithChildren } from "react"

// A wrapper for the content of all pages to ensure that they account for the 
// sidebar and topbar
export const BodyContainer: FC<PropsWithChildren> = ({children}) => {
    return (
        <Box sx={{paddingLeft:"240px"}}> 
            <Toolbar />
            {children}
        </Box>
    )
}