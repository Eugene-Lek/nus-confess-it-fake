import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";
import { LoadingButton } from "@mui/lab";
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { TypedMutationTrigger } from "@reduxjs/toolkit/query/react";
import { FC } from "react";
import { closed } from "./popup_slice";

export interface deleteConfimationProps {
    deleteQueryFunc: TypedMutationTrigger<any, any, any> | null
    resourceId: string
    isDeleting: boolean
}

export const DeleteConfirmation: FC<deleteConfimationProps> = ({deleteQueryFunc, resourceId, isDeleting}) => {
    const dispatch = useAppDispatch()
        
    if (!deleteQueryFunc) {
        console.log("reached")
        // If the delete function has not been set due to a programming error, end rendering of the component
        return
    }

    const handleClose = () => dispatch(closed())

    const handleDelete = async() => {      
        try {
            await deleteQueryFunc(resourceId).unwrap()
            dispatch(closed())
        } catch (err: any) {
            defaultFetchErrorHandler(err, dispatch)
        }
    }

    return (
        <>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogContent>
                <DialogContentText>Are you sure you want to delete this?</DialogContentText>                
            </DialogContent>
            <DialogActions>
            <LoadingButton onClick={handleClose} loading={isDeleting}>Cancel</LoadingButton>
            <LoadingButton onClick={handleDelete} loading={isDeleting}>Confirm</LoadingButton>
            </DialogActions>
        </>
    )
}