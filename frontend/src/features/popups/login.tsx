import { useAppDispatch } from "@/redux/hooks";
import { DialogActions, DialogContent, DialogContentText, DialogTitle, Link, TextField } from "@mui/material";
import { FC, useState } from "react";
import { clickedSignup, closed } from "./popup_slice";
import { loggedIn } from "../auth/auth";
import { LoadingButton } from "@mui/lab";
import { useLoginMutation } from "./api_slice";
import { useRouter } from "next/router";
import { PasswordField } from "./password_field";

export const Login: FC = () => {
    const dispatch = useAppDispatch()
    const handleClose = () => dispatch(closed())

    const [error, setError] = useState("")
    const [login,  { isLoading }] = useLoginMutation()
    const router = useRouter()
    const onSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
    
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
    
        try {
            await login({username: formJson.username, password: formJson.password}).unwrap()

            // update login state
            loggedIn(formJson.username)
            dispatch(closed())
            router.reload() // Reload the page to reflect the new authenticated status

        } catch (err: any) {
            if (err.status == 401) {
                setError("Invalid username or password")
            } else {
                setError(err.data.message)
            }
        }
    }

    return (
        <form onSubmit={onSubmit}>
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
                disabled={isLoading}
            />
            <PasswordField
                required
                margin="dense"
                id="password"
                name="password"
                label="Password"
                fullWidth
                size="small"
                variant="standard"
                disabled={isLoading}
            />
                <DialogContentText color="#d32f2f" fontSize={12} sx={{visibility: error ? "visible" : "hidden"}}>
                    {`${error}`}
                </DialogContentText>
                <DialogContentText>{"Don't have an account? "}
                    <Link color="#000000" sx={{cursor: 'pointer'}} onClick={() => dispatch(clickedSignup())}>
                        Sign up here!
                    </Link>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
            <LoadingButton onClick={handleClose} loading={isLoading}>Cancel</LoadingButton>
            <LoadingButton type="submit" loading={isLoading}>Login</LoadingButton>
            </DialogActions>
        </form>
    )
}