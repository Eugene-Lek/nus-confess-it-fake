import { userIsLoggedIn } from "@/features/auth/auth";
import { useCreatePostMutation, useGetPostByIdQuery, useUpdateDraftToPostMutation, useUpdatePostMutation } from "@/features/content/posts/api_slice";
import { PostEditor, postEditorSchema } from "@/features/content/posts/post_editor";
import { clickedLogin } from "@/features/popups/popup_slice";
import { hideBothFilters, showBothFilters } from "@/features/topbar/filter_slice";
import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";
import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import { FormikProps, useFormik } from "formik";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function EditPost() {
    const dispatch = useAppDispatch()

    // Hide the keywords and tag filter in the top bar since they are irrelevant
    dispatch(hideBothFilters()) 
    
    // When the user navigates to another page (i.e. when the component dismounts),
    // show both filters again
    useEffect(() => {
        return () => {
            dispatch(showBothFilters())
        }
    }, [])      

    const authenticated = userIsLoggedIn()
    if (!authenticated) {
        dispatch(clickedLogin())
        return <></>
    }

    // useFormik hook is like useState, but for forms.
    // It tracks the user's inputs and keeps track of validation errors, if any
    const formState: FormikProps<any> = useFormik({
      validationSchema: postEditorSchema,
      onSubmit: (input) => {},
      initialValues: {title: "", body: "", tags: Array(0)}
  })

    const postId = useSearchParams().get("postId")
    if (!postId) {
      return <></>
    }

    const {data: post} = useGetPostByIdQuery(postId)
    useEffect(() => {
      // Load in the existing data once it has been fetched
      formState.setFieldValue("title", post?.title || "", true)
      formState.setFieldValue("body", post?.body || "", true)
      formState.setFieldValue("tags", post?.tags || "", true)
    }, [post])

    const [updateDraftToPost,  { isLoading: isLoading1 }] = useUpdateDraftToPostMutation()
    const [updatePost,  { isLoading: isLoading2 }] = useUpdatePostMutation()
    const router = useRouter()
    const onClickPublish = async() => {
      try {      
        if (!post) {
          // If the post has not yet loaded, prevent saving
          return
        }
        const updatedPost = {
          ...formState.values,
          id: post.id,
          status: "Published"
        }

        if (post.status == "Published") {
          await updatePost(updatedPost).unwrap()
        } else {
          await updateDraftToPost(updatedPost).unwrap()
        }
        router.push(`/posts/${post.id}`)

      } catch (err: any) {
          defaultFetchErrorHandler(err, dispatch)
      }
    }

    const onClickSave = async() => {
      try {      
        if (!post) {
          // If the post has not yet loaded, prevent saving
          return
        }
                
        const updatedPost = {
          ...formState.values,
          id: post.id,
          status: "Draft"
        }
        await updatePost(updatedPost).unwrap()

      } catch (err: any) {
          defaultFetchErrorHandler(err, dispatch)
      }
    }    

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px", px:"40px", paddingTop: "30px", paddingBottom:"200px"}}>
            <Typography variant="h5" fontWeight={"bold"} color="space">Edit Post</Typography>
            <PostEditor formState={formState}/>            
            <Box sx={{display:"flex", gap:"20px", marginLeft: "auto", marginRight: 0}}>
                {post?.status == "Draft"
                  ? <LoadingButton variant="contained" color="khaki" onClick={onClickSave} loading={isLoading1 || isLoading2} disabled={Object.keys(formState.errors).length > 0 || !post}>
                      Save Draft
                    </LoadingButton>
                  : <></>}             
              <LoadingButton variant="contained" color="khaki" onClick={onClickPublish} loading={isLoading1 || isLoading2} disabled={Object.keys(formState.errors).length > 0 || !post}>
                {post?.status == "Draft"
                  ? "Post"
                  : "Save"}
              </LoadingButton>
            </Box>            
        </Box>
    )
}