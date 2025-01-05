import { getUser } from "@/features/auth/auth";
import { useGetLikedCommentsQuery } from "@/features/content/comments/api_slice";
import { CommentCardsInListing } from "@/features/content/comments/comment_cards";

export default function LikedComments() {
  return (
      <CommentCardsInListing 
        apiQueryHook={useGetLikedCommentsQuery} 
        extraProps={{likedBy: getUser()}}
        title="Liked Comments"
      />
  )
}