import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, TextField } from "@mui/material";
import { FC, useState } from "react";
import { clickedSignup, clickedSubmit, closed, errorOccured } from "./popup_slice";
import { AppDispatch } from "@/redux/store";
import { loggedIn } from "../global/session_slice";
import { LoadingButton } from "@mui/lab";

interface Login {
    username: string
    password: string
}

export const submitLogin = async(event: React.FormEvent<HTMLFormElement>, dispatch: AppDispatch) => {
    event.preventDefault();
    dispatch(clickedSubmit())

    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());

    // Make API to authenticate user & create session
    await new Promise(r => setTimeout(r, 2000));
    dispatch(loggedIn(formJson.username))
    dispatch(closed())
    /*
    const response = await fetch("", {
        method: "POST",
        body: JSON.stringify(formJson)
    })
    if (response.ok) {
        // update login state
        dispatch(loggedIn())
        dispatch(closed())
    } else {
        const response_data = await response.json()
        if (response_data.code == 401) {
            dispatch(errorOccured("Invalid username or password"))
        } else {
            dispatch(errorOccured(response_data.message))
        }
    }
    */
  }


export const Login: FC = () => {
    const error = useAppSelector((state) => state.popup.error)
    const loading = useAppSelector((state) => state.popup.loading)
    const dispatch = useAppDispatch()
    const handleClose = () => dispatch(closed())

    return (
        <>
            <DialogTitle>Login</DialogTitle>
            <DialogContent>
            <TextField
                required
                margin="dense"
                id="username"
                name="username"
                label="Username"
                type="text"
                fullWidth
                size="small"
                variant="standard"
                disabled={loading}
            />
            <TextField
                required
                margin="dense"
                id="password"
                name="password"
                label="Password"
                type="password"
                fullWidth
                size="small"
                variant="standard"
                disabled={loading}
            />
                <DialogContentText color="#d32f2f" fontSize={12} sx={{visibility: error ? "visible" : "hidden"}}>
                    {/*White space is appended to the end of the errorto ensure 
                    that the component is always inserted into the dom tree*/}
                    {`${error} `}
                </DialogContentText>
                <DialogContentText>{"Don't have an account? "}
                    <Link color="#000000" sx={{cursor: 'pointer'}} onClick={() => dispatch(clickedSignup())}>
                        Sign up here!
                    </Link>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
            <LoadingButton onClick={handleClose} loading={loading}>Cancel</LoadingButton>
            <LoadingButton type="submit" loading={loading}>Login</LoadingButton>
            </DialogActions>
        </>
    )
}