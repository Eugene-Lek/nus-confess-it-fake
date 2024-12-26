import { useAppDispatch } from "@/redux/hooks";
import { FC, useState } from "react";
import { loggedOut } from "../auth/auth";
import { LoadingButton } from "@mui/lab";
import { errorOccured } from "../popups/popup_slice";
import { useLogoutMutation } from "../popups/api_slice";
import { useRouter } from "next/router";

export const LogoutButton: FC = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()

    const [logout,  { isLoading }] = useLogoutMutation()
    const handleLogout = async() => {

        try {
            await logout().unwrap()

            loggedOut()
            router.push("/")

        } catch (err: any) {
            // err returns has a property "data" that corresponds to the response body
            dispatch(errorOccured(err.data.message))
        }
    }

    return (
        <LoadingButton variant="contained" onClick={handleLogout} loading={isLoading} color="khaki">Logout</LoadingButton>
    )
}