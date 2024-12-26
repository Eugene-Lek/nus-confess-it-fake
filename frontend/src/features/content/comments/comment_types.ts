export interface Comment {
    id: string,
    body: string,
    postId: string,
    parentComment: Comment | null
    author: string,
    status: string,
    likes: number,
    dislikes: number,
    createdAt: string, 
    updatedAt: string,
    userVote: "Like" | "Dislike" | ""
}

export interface NewComment {
    id: string,
    body: string,
    postId: string,
    parentId: string,
    parentAuthor: string,
    parentBody: string
}