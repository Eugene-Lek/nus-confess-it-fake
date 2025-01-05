import { getUser, userIsLoggedIn } from "@/features/auth/auth";
import { useGetMyDraftsQuery } from "@/features/content/posts/api_slice";
import { PostCards } from "@/features/content/posts/post_cards";
import { clickedLogin } from "@/features/popups/popup_slice";
import { useAppDispatch } from "@/redux/hooks";


export default function MyDrafts() {
  const dispatch = useAppDispatch()

  // Direct the user to login if they have not done so
  const authenticated = userIsLoggedIn()
  if (!authenticated) {
      dispatch(clickedLogin())
      return <></>
  } 

  return (
      <PostCards 
        apiQueryHook={useGetMyDraftsQuery} 
        extraProps={{author: getUser()}}
        title="My Drafts"
      />
  )
}
