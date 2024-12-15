import { useAppDispatch } from "@/redux/hooks";
import { Button } from "@mui/material";
import { FC } from "react";
import { clickedLogin } from "../popups/popup_slice";

export const LoginButton: FC = () => {
    const dispatch = useAppDispatch()

    return (
        <Button variant="contained" onClick={() => dispatch(clickedLogin())} color="midBlue">Login</Button>
    )
}