import { useAppDispatch } from "@/redux/hooks";
import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { FC } from "react";
import { loggedOut } from "../auth/auth";
import { OnClickMenu } from "../content/onclick_menu";
import { useLogoutMutation } from "../popups/api_slice";
import { errorOccured } from "../popups/popup_slice";

export const LogoutButton: FC = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()

    const [logout,  { isLoading }] = useLogoutMutation()
    const handleLogout = async() => {

        try {
            await logout().unwrap()

            loggedOut()
            router.push("/")

        } catch (err: any) {
            // err returns has a property "data" that corresponds to the response body
            dispatch(errorOccured(err.data.message))
        }
    }

    // If the screen is small or medium, show a menu that pops up upon clicking it with a logout option
    // Otherwise, show a logout button
    return (
        <>
            <Box sx={{display: {xs: "block", sm: "block", md: "block", lg: "none"}}}>
                <OnClickMenu options={[{label: "Logout", onClick: handleLogout}]}/>
            </Box>
            <LoadingButton 
                variant="contained" 
                onClick={handleLogout} 
                loading={isLoading} 
                color="lightBrown"
                sx={{display: {xs: "none", sm: "none", md: "none", lg: "block"}}}
            >Logout
            </LoadingButton>        
        </>        
    )
}