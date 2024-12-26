import { useGetPostByIdQuery } from "@/features/content/posts/api_slice";
import { PostComponent } from "@/features/content/posts/post";
import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";


export default function PostPage() {
    const {postId} = useParams<{postId: string}>()
    if (!postId) {
      const router = useRouter()
      router.push("/")
      return
    }

    const dispatch = useAppDispatch()

    var {data: post, error} = useGetPostByIdQuery(postId)
    defaultFetchErrorHandler(error, dispatch)

    if (!post) {
      return
    }

    return (
      <PostComponent {...post}/>
    )
}