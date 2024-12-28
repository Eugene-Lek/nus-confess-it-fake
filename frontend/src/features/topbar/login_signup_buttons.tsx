import { Box } from "@mui/material"
import { LoginButton } from "./login_button"
import { SignUpButton } from "./signup_button"
import { OnClickMenu } from "../content/onclick_menu"
import { useAppDispatch } from "@/redux/hooks"
import { clickedLogin, clickedSignup } from "../popups/popup_slice"

export const LoginSignUpButtons = () => {
    const dispatch = useAppDispatch()

    // Menu and its options will only be displayed when the screen is medium and small
    const menuOptions = [
        {label: "Login", onClick: () => dispatch(clickedLogin())},
        {label: "Sign Up", onClick: () => dispatch(clickedSignup())},
    ]

    return (
        <>
            <Box sx={{display: {xs: "block", sm: "block", md: "block", lg: "none"}}}>
                <OnClickMenu options={menuOptions}/>
            </Box>
            <Box sx={{display: {xs: "none", sm: "none", md: "none", lg: "flex"}, gap: "20px"}}>
                <LoginButton/>
                <SignUpButton/>
            </Box>     
        </>        
    )
}