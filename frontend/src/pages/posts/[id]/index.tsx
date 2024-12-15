import { Post } from "@/features/content/post";
import { useSearchParams } from "next/navigation";


export default function PostPage() {
    const searchParams = useSearchParams()
    const postId = searchParams.get('id')

    // TODO 
    // make api call to get post data & comments
    const post = {id: "1", title: "any negative things to share about Houses (PH, HH, LH)", body: "a relative i know is thinking of staying in houses but i have absolutely no clue", tags:["Question", "Louis"], likes: 10, dislikes: 1, author: "tom", createdAt: "11/11/12, 12:24", updatedAt: ""}

    return (
      <Post {...post}/>
    )
}