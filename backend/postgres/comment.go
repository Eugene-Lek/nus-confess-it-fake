package postgres

type Comment struct {
	id string
	body string
	author string
	postId string
	parentId string
	status Status
	likes int
	dislikes int
	createdAt string
	updatedAt string
}