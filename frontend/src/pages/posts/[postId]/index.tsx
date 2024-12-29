import { useGetPostByIdQuery } from "@/features/content/posts/api_slice";
import { PostComponent } from "@/features/content/posts/post";
import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";


export default function PostPage() {
    const {postId} = useParams<{postId: string}>()

    const dispatch = useAppDispatch()
    const router = useRouter()

    const {data: post, error} = useGetPostByIdQuery(postId || "")
    if (!postId) {
      router.push("/")
      return
    }
    defaultFetchErrorHandler(error, dispatch)   

    if (!post) {
      return
    }

    return (
      <PostComponent {...post}/>
    )
}