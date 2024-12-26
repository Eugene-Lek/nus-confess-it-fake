export interface Post {
    id: string,
    title: string,
    body: string,
    tags: string[],
    author: string,
    likes: number,
    dislikes: number,
    status: string,
    createdAt: string,
    updatedAt: string,
    userVote: "Like" | "Dislike" | ""    
}

export interface NewPost {
    id: string,
    title: string,
    body: string,
    tags: string[],
    status: string,
}