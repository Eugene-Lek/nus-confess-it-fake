import { Box, Toolbar } from "@mui/material"
import { FC, PropsWithChildren } from "react"
import styles from "../topbar/topbar.module.css"

// A wrapper for the content of all pages to ensure that they account for the 
// sidebar and topbar
export const BodyContainer: FC<PropsWithChildren> = ({children}) => {
    return (
        <Box className="maximise-width" sx={{display: "flex"}}>  
            <Box className="hide-on-xs show-on-medium" sx={{minWidth: "240px"}}/>
            <Box className="maximise-width"> 
                <Toolbar className={`${styles["topbar-padding"]} ${styles["topbar-height"]}`}/>
                {children}
            </Box>
        </Box>
    )
}