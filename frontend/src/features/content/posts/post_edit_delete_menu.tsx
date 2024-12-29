import { clickedDelete } from "@/features/popups/popup_slice"
import { OnClickMenu } from "../onclick_menu"
import { useAppDispatch } from "@/redux/hooks"
import { useRouter } from "next/router"
import { useDeletePostMutation } from "./api_slice"
import { FC, useContext } from "react"
import { PopUpContext } from "@/features/popups/popup_context"
import { getUser } from "@/features/auth/auth"
import { Post } from "./post_types"

export const PostEditDeleteMenu: FC<Post> = ({id, author, status}) => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [deletePost, {isLoading}] = useDeletePostMutation()
    const {setDeleteQueryFunc} = useContext(PopUpContext)    
    
    if (author != getUser() || status == "Deleted") {
        // If the post doesn't belong to the user, they aren't allowed to edit or delete the post
        return <></> 
    }

    const menuOptions = [
        {
            label: "Edit",
            onClick: () => {
                router.push(`/edit?postId=${id}`)
            }
        },
        {
            label: "Delete",
            onClick: () => {                
                if (setDeleteQueryFunc) {
                    setDeleteQueryFunc(() => deletePost)
                }                
                dispatch(clickedDelete({isDeleting: isLoading, resourceId: id}))
            }
        }
    ]

    return <OnClickMenu options={menuOptions}/>
}