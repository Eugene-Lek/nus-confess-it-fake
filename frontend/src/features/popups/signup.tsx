import { useAppDispatch } from "@/redux/hooks";
import { hasError } from "@/validation/helpers";
import Yup from "@/validation/yup";
import { LoadingButton } from "@mui/lab";
import { DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { FormikProps, useFormik } from "formik";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { loggedIn } from "../auth/auth";
import { useCreateUserMutation } from "./api_slice";
import { PasswordField } from "./password_field";
import { closed } from "./popup_slice";

export const SignUp: FC = () => {
    const dispatch = useAppDispatch()
    const handleClose = () => dispatch(closed())

   // Yup provides an easy way to define input validation checks
    const schema = Yup.object({
        username: Yup.string()
            .default("")
            .required("Required")
            .min(2, "Username must have at least 2 characters")
            .max(32, "Username can have at most 20 characters")
            .matches(/^[a-zA-Z0-9_]*$/, "Username can only contain alphanumeric characters and underscores (_)"),
        password: (Yup as any).string()
            .default("")
            .required("Required")
            .password()
            .min(10, "Password has to be at least 10 characters long"),
        confirmPassword: (Yup as any).string()
            .default("")
            .required("Required")
            .password()
            .min(10, "Password has to be at least 10 characters long")
            .test("test-match", "Passwords should match", (value: string, context: any) => {
                const { password } = context.parent;
                return password === value;
            }),
    })
    
    // useFormik hook is like useState, but for forms.
    // It tracks the user's inputs and keeps track of validation errors, if any
    const formState: FormikProps<any> = useFormik({
        validationSchema: schema,
        onSubmit: () => undefined, // This is set to a dummy function as it will not be used
        initialValues: {username: "", password: "", confirmPassword: ""}
    })

    const [error, setError] = useState("")
    const [createUser,  { isLoading }] = useCreateUserMutation()
    const router = useRouter()
    const onSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        const username = formJson.username
    
        try {
            await createUser({username: formJson.username, password: formJson.password}).unwrap()

            // update login state
            loggedIn(username)
            dispatch(closed())
            router.reload() // Reload the page to reflect the new authenticated status

        } catch (err: any) {
            if (err.data.code == "INVALID-INPUT-ERROR") {
                setError("One or more inputs were invalid")
            } else if (err.data.code == "UNIQUE-VIOLATION-ERROR") {
                setError(`The username '${username}' already exists`)
            } else {
                setError(err.data.message)
            }
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <DialogTitle>Sign up</DialogTitle>
            <DialogContent>
            <TextField
                required
                margin="dense"
                id="username"
                label="Username"
                type="text"
                fullWidth
                size="small"
                variant="standard"
                error={hasError(formState, "username")}
                helperText={hasError(formState, "username") ? String(formState.errors["username"]) : ""}
                {...formState.getFieldProps("username")} // Sets the onChange function to a function that updates the form state
            />
            <PasswordField
                required
                margin="dense"
                id="password"
                label="Password"
                fullWidth
                size="small"
                variant="standard"
                error={hasError(formState, "password")}
                helperText={hasError(formState, "password")? String(formState.errors["password"]) : ""}
                {...formState.getFieldProps("password")} // Sets the onChange function to a function that updates the form state
            />
            <PasswordField
                required
                margin="dense"
                id="confirmPassword"
                label="Confirm Password"
                fullWidth
                size="small"
                variant="standard"
                error={hasError(formState, "confirmPassword")}
                helperText={hasError(formState, "confirmPassword")? String(formState.errors["confirmPassword"]) : ""}
                {...formState.getFieldProps("confirmPassword")} // Sets the onChange function to a function that updates the form state
            />
            <DialogContentText color="#d32f2f" fontSize={12} sx={{visibility: error ? "visible" : "hidden"}}>
                {/*White space is appended to the end of the error to ensure 
                that the component is always inserted into the dom tree*/}
                {`${error} `}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <LoadingButton onClick={handleClose} loading={isLoading}>Cancel</LoadingButton>
            <LoadingButton type="submit" loading={isLoading} disabled={Object.keys(formState.errors).length > 0}>Sign Up</LoadingButton>
            </DialogActions>
        </form>
    )
}