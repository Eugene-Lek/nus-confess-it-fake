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
            <Box className="hide-on-large">
                <OnClickMenu options={menuOptions}/>
            </Box>
            <Box className="hide-on-xs show-on-large" sx={{display: {lg: "flex"}, gap: "20px"}}>
                <LoginButton/>
                <SignUpButton/>
            </Box>     
        </>        
    )
}