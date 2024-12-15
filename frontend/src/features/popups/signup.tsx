import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { FC } from "react";
import { clickedSubmit, closed } from "./popup_slice";
import { AppDispatch } from "@/redux/store";
import Yup from "@/validation/yup";
import { FormikProps, useFormik } from "formik";
import { hasError } from "@/validation/helpers";
import { LoadingButton } from "@mui/lab";

export const submitSignup = async(event: React.FormEvent<HTMLFormElement>, dispatch: AppDispatch) => {
    event.preventDefault();
    dispatch(clickedSubmit())

    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    
    try {
      await fetch("", {
          method: "POST",
          body: JSON.stringify(formJson)
      })
    } catch {
    }
    
    dispatch(closed())
  }

export const SignUp: FC = () => {
    const error = useAppSelector((state) => state.popup.error)
    const loading = useAppSelector((state) => state.popup.loading)
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
        onSubmit: (input) => undefined, // This is set to a dummy function as it will not be used
        initialValues: {username: "", password: "", confirmPassword: ""}
    })

    console.log(formState.errors)

    return (
        <>
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
            <TextField
                required
                margin="dense"
                id="password"
                label="Password"
                type="password"
                fullWidth
                size="small"
                variant="standard"
                error={hasError(formState, "password")}
                helperText={hasError(formState, "password")? String(formState.errors["password"]) : ""}
                {...formState.getFieldProps("password")} // Sets the onChange function to a function that updates the form state
            />
            <TextField
                required
                margin="dense"
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                fullWidth
                size="small"
                variant="standard"
                error={hasError(formState, "confirmPassword")}
                helperText={hasError(formState, "confirmPassword")? String(formState.errors["confirmPassword"]) : ""}
                {...formState.getFieldProps("confirmPassword")} // Sets the onChange function to a function that updates the form state
            />
            <DialogContentText color="#FF0000" fontSize={12} sx={{visibility: error ? "visible" : "hidden"}}>
                {/*White space is appended to the end of the errorto ensure 
                that the component is always inserted into the dom tree*/}
                {`${error} `}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <LoadingButton onClick={handleClose} loading={loading}>Cancel</LoadingButton>
            <LoadingButton type="submit" loading={loading} disabled={Object.keys(formState.errors).length > 0}>Sign Up</LoadingButton>
            </DialogActions>
        </>
    )
}