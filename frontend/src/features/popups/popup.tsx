import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Dialog } from "@mui/material";
import { FC, useContext } from "react";
import { DeleteConfirmation } from "./delete_confirmation";
import { Error } from "./error";
import { Login } from "./login";
import { PopUpContext } from "./popup_context";
import { closed } from "./popup_slice";
import { SignUp } from "./signup";


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