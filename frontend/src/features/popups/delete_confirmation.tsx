import { useAppDispatch } from "@/redux/hooks";
import { DialogActions, DialogContent, DialogContentText, DialogTitle, Link, TextField } from "@mui/material";
import { FC, useState } from "react";
import { clickedSignup, closed } from "./popup_slice";
import { loggedIn } from "../auth/auth";
import { LoadingButton } from "@mui/lab";
import { useLoginMutation } from "./api_slice";
import { useRouter } from "next/router";
import { TypedMutationTrigger } from "@reduxjs/toolkit/query/react";
import { defaultFetchErrorHandler } from "@/redux/api";

export interface deleteConfimationProps {
    deleteQueryFunc: TypedMutationTrigger<any, any, any> | null
    resourceId: string
    isDeleting: boolean
}

export const DeleteConfirmation: FC<deleteConfimationProps> = ({deleteQueryFunc, resourceId, isDeleting}) => {
    if (!deleteQueryFunc) {
        console.log("reached")
        // If the delete function has not been set due to a programming error, end rendering of the component
        return
    }

    const dispatch = useAppDispatch()
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