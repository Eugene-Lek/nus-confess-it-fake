import { PostCards } from "@/features/content/posts/post_cards";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useGetLikedPostsQuery } from "@/features/content/posts/api_slice";
import { defaultFetchErrorHandler } from "@/redux/api";
import { getUser, userIsLoggedIn } from "@/features/auth/auth";
import { clickedLogin } from "@/features/popups/popup_slice";

export default function LikedPosts() {
  const dispatch = useAppDispatch()

  // Direct the user to login if they have not done so
  const authenticated = userIsLoggedIn()
  if (!authenticated) {
      dispatch(clickedLogin())
      return <></>
  } 

  return (
      <PostCards apiQueryHook={useGetLikedPostsQuery} extraProps={{likedBy: getUser()}}/>
  )
}
