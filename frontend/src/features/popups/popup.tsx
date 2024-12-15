import { Dialog} from "@mui/material";
import { FC } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { closed } from "./popup_slice";
import { Login, submitLogin } from "./login";
import { SignUp, submitSignup } from "./signup";



export const PopUp: FC = () => {
    const type = useAppSelector((state) => state.popup.type)
    const dispatch = useAppDispatch()
    const handleClose = () => dispatch(closed())

    return (
        <Dialog
        open={type != "closed"}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{
                component: 'form',
                onSubmit: async(e: React.FormEvent<HTMLFormElement>) => {
                    if (type == "login") {
                        submitLogin(e, dispatch)
                    } else {
                        submitSignup(e, dispatch)
                    }                           
                }}
            }
      >
        {type == "login" 
            ? <Login/> 
            : type == "signup"
            ? <SignUp/>
            : <></>}
      </Dialog>
    )
}