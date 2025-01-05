import { PostCards } from "@/features/content/posts/post_cards";
import { useGetPostsQuery } from "@/features/content/posts/api_slice";


export default function Home() {
  return (
      <PostCards apiQueryHook={useGetPostsQuery} title="Home"/>
  )
}
