import { Dialog, PaperProps} from "@mui/material";
import { ElementType, FC, JSX, useContext } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { closed } from "./popup_slice";
import { Login } from "./login";
import { SignUp } from "./signup";
import { Error } from "./error";
import { DeleteConfirmation } from "./delete_confirmation";
import { PopUpContext } from "./popup_context";


// This component is meant to be a singleton to ensure that at most 1 popup can exist at all times
export const PopUp: FC = () => {
    const open = useAppSelector((state) => state.popup.open)
    const type = useAppSelector((state) => state.popup.type)
    const dispatch = useAppDispatch()
    const handleClose = () => dispatch(closed())

    const {deleteQueryFunc} = useContext(PopUpContext)
    const resourceId = useAppSelector((state) => state.popup.props.resourceId)
    const isDeleting = useAppSelector((state) => state.popup.props.isDeleting)

    return (
        <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
      >
        {type == "login" 
            ? <Login/> 
            : type == "signup"
            ? <SignUp/>
            : type == "delete confirmation"
            ? <DeleteConfirmation 
                  deleteQueryFunc={deleteQueryFunc}
                  resourceId={resourceId}
                  isDeleting={isDeleting}/>
            : type == "error"
            ? <Error/>
            : <></>}
      </Dialog>
    )
}