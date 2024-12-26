import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { FC } from "react";
import { closed } from "./popup_slice";
import { LoadingButton } from "@mui/lab";

export const Error: FC = () => {
    const error = useAppSelector((state) => state.popup.error)
    const dispatch = useAppDispatch()
    const handleClose = () => dispatch(closed())

    return (
        <>
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
                <DialogContentText>{error}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleClose}>Close</LoadingButton>
            </DialogActions>
        </>
    )
}