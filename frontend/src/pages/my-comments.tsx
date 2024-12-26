import { getUser} from "@/features/auth/auth";
import { useGetMyCommentsQuery } from "@/features/content/comments/api_slice";
import { CommentCardsInListing } from "@/features/content/comments/comment_cards";


export default function MyComments() {
  return (
      <CommentCardsInListing apiQueryHook={useGetMyCommentsQuery} extraProps={{author: getUser()}}/>
  )
}