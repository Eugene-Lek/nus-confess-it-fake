import { useAppDispatch } from "@/redux/hooks";
import { FC, useState } from "react";
import { loggedOut } from "../global/session_slice";
import { LoadingButton } from "@mui/lab";

export const LogoutButton: FC = () => {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)

    const handleLogout = async() => {
        setLoading(true)
        // Make API call to delete session
        await new Promise(r => setTimeout(r, 2000));
        setLoading(false)
        dispatch(loggedOut())
    }

    return (
        <LoadingButton variant="contained" onClick={handleLogout} loading={loading} color="midBlue">Logout</LoadingButton>
    )
}