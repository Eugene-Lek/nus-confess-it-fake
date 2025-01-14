import { userIsLoggedIn } from "@/features/auth/auth";
import { useCreatePostMutation } from "@/features/content/posts/api_slice";
import { PostEditor, postEditorSchema } from "@/features/content/posts/post_editor";
import { clickedLogin } from "@/features/popups/popup_slice";
import { hideBothFilters, showBothFilters } from "@/features/topbar/filter_slice";
import { defaultFetchErrorHandler } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";
import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import { FormikProps, useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {v4 as uuidv4} from 'uuid';
import styles from "../features/content/content.module.css"

export default function CreatePost() {
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

    // useFormik hook is like useState, but for forms.
    // It tracks the user's inputs and keeps track of validation errors, if any
    const formState: FormikProps<any> = useFormik({
        validationSchema: postEditorSchema,
        onSubmit: () => {},
        initialValues: {title: "", body: "", tags: Array(0)}
    })

    const [createPost,  { isLoading }] = useCreatePostMutation()
    const router = useRouter()
    const onClickPost = async() => {
      try {      
        const post = {
          ...formState.values,
          id: uuidv4(),
          status: "Published"
        }
        await createPost(post).unwrap()
        router.push(`/posts/${post.id}`)

      } catch (err: any) {
          defaultFetchErrorHandler(err, dispatch)
      }
    }

    const onClickSave = async() => {
      try {      
        const post = {
          ...formState.values,
          id: uuidv4(),
          status: "Draft"
        }
        await createPost(post).unwrap()
        router.push(`/edit?postId=${post.id}`)

      } catch (err: any) {
          defaultFetchErrorHandler(err, dispatch)
      }
    }

    const authenticated = userIsLoggedIn()
    if (!authenticated) {
        dispatch(clickedLogin())
        return <></>
    }    

    return (
        <Box className={`maximise-width ${styles["create-edit-post-page"]}`} >
            <Typography variant="h5" fontWeight={"bold"}>Create Post</Typography>
            <PostEditor formState={formState}/>            
            <Box sx={{display:"flex", gap:"20px", marginLeft: "auto", marginRight: 0}}>
              <LoadingButton variant="contained" color="lightBrown" onClick={onClickSave} loading={isLoading} disabled={Object.keys(formState.errors).length > 0}>Save Draft</LoadingButton>
              <LoadingButton variant="contained" color="lightBrown" onClick={onClickPost} loading={isLoading} disabled={Object.keys(formState.errors).length > 0}>Post</LoadingButton>
            </Box>            
        </Box>
    )
}