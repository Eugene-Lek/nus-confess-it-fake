import { PostCards } from "@/features/content/posts/post_cards";
import { useAppDispatch} from "@/redux/hooks";
import { useGetMyPostsQuery } from "@/features/content/posts/api_slice";
import { getUser, userIsLoggedIn } from "@/features/auth/auth";
import { clickedLogin } from "@/features/popups/popup_slice";

export default function MyPosts() {
    const dispatch = useAppDispatch()

    // Direct the user to login if they have not done so
    const authenticated = userIsLoggedIn()
    if (!authenticated) {
        dispatch(clickedLogin())
        return <></>
    } 

  return (
      <PostCards 
        apiQueryHook={useGetMyPostsQuery} 
        extraProps={{author: getUser()}}
        title={"My Posts"}
      />
  )
}
