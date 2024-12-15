import { useAppDispatch } from "@/redux/hooks";
import { Button } from "@mui/material";
import { FC } from "react";
import { clickedSignup } from "../popups/popup_slice";

export const SignUpButton: FC = () => {
    const dispatch = useAppDispatch()

    return (
        <Button variant="contained" onClick={() => dispatch(clickedSignup())} color="midBlue">Sign Up</Button>
    )
}