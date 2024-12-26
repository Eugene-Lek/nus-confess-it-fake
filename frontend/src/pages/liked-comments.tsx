import { getUser, userIsLoggedIn } from "@/features/auth/auth";
import { useGetLikedCommentsQuery } from "@/features/content/comments/api_slice";
import { Comment } from "@/features/content/comments/comment_card";
import { CommentCardsInListing } from "@/features/content/comments/comment_cards";
import { SortBySelect } from "@/features/content/sort_by_select";
import { clickedLogin } from "@/features/popups/popup_slice";
import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

export default function LikedComments() {
  return (
      <CommentCardsInListing apiQueryHook={useGetLikedCommentsQuery} extraProps={{likedBy: getUser()}}/>
  )
}