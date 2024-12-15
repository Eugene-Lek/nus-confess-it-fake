import { Box } from "@mui/material"
import { Post } from "./post"
import { PostCard } from "./post_card"


const posts: Post[] = [
    {id: "1", title: "any negative things to share about Houses (PH, HH, LH)", body: "a relative i know is thinking of staying in houses but i have absolutely no clue", tags:["Question", "Louis"], likes: 10, dislikes: 1, author: "tom", createdAt: "11/11/12, 12:24", updatedAt: ""},
    {id: "2", title: "Why could Louis never pull ahead even if he had strong suits (lol)/qualities that Harvey didn't have ?", body: "I'm not a lawyer but I find it hard to believe there wasn't a need for a lawyer who specialized in finances like Louis did, he clearly had an advantage over Harvey in that area and it didn't go unnoticed, yet it was never enough to promote him or give him some sort of reward. I get that Harvey was overall more valuable to the firm but I still find it hard to believe Louis's strengths were so underused and under appreciated especially at an important firm like that", tags:["Spoilers"],likes: 10, dislikes: 201, author: "jerry", createdAt: "11/11/12, 12:24", updatedAt: ""},
    {id: "3", title: "Is WaniKani worth it?", body: `I already use genki, anki, and other resources but I was wondering if it's worth paying for wanikani. To those of you who've used it for a while, what are the benefits? Would it make learning kanji easier?\n\nEdit: Thank you all for your responses. It sounds like something that could really help me, I'll give the first three levels a try and see from there.`, tags:["Resources"],likes: 1, dislikes: 1, author: "tom", createdAt: "11/11/12, 12:24", updatedAt: ""},
    {id: "4", title: "[AskJS] Was Bringing JavaScript to the Server a Good Decision or Bad?", body: "I’m curious to hear what people think about the decision to bring JavaScript to the server with tools like Node.js. While there were arguably better languages for server-side development (like Python, Go, or Java), do you think JavaScript’s rise on the server was a good move? Has it made things easier by unifying the stack, or has it caused more issues, especially in terms of performance and complexity? Would love to hear your thoughts and experiences!", tags:["askJS"],likes: 120, dislikes: 0, author: "jerry", createdAt: "11/11/12, 12:24", updatedAt: ""},
    {id: "5", title: "mike is a pathological liar", body: "prove me wrong", tags:["Character related"],likes: 10, dislikes: 1, author: "tom", createdAt: "11/11/12, 12:24", updatedAt: ""},
]

export const PostCards = () => {
    // Get posts from redux store

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "30px", px:"40px", paddingTop: "30px", paddingBottom:"200px"}}>
            {posts.map((post) => <PostCard key={post.id} {...post}></PostCard>)}
        </Box>
    )

}