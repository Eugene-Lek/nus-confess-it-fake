import { Autocomplete, Box, Button, Chip, DialogContentText, TextField, Typography } from "@mui/material"
import { MDXEditor, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin, listsPlugin, ListsToggle, setMarkdown$, MDXEditorMethods } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import styles from "../content.module.css"
import { useGetTagsQuery } from "./api_slice"
import { FormikProps } from "formik"
import Yup from "@/validation/yup"
import { hasError } from "@/validation/helpers"
import { FC, useEffect, useRef } from "react"

// Yup provides an easy way to define input validation checks
export const postEditorSchema = Yup.object({
    title: Yup.string()
        .default("")
        .required("Required"),
    body: Yup.string()
        .default("")
        .required("Required"),
    tags: Yup.array(Yup.string())
})

export const PostEditor: FC<{formState: FormikProps<any>}> = ({formState}) => {
    const {data: tagSuggestions, isFetching} = useGetTagsQuery()
    const mdxEditorRef = useRef<MDXEditorMethods>(null)

    useEffect(() => {
      if (mdxEditorRef.current) {
        mdxEditorRef.current.setMarkdown(formState.values["body"])
      }
    }, [formState.values["body"]])

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px"}}>
            <TextField 
                label="Title" 
                variant="outlined" 
                size="small" 
                rows={1}
                error={hasError(formState, "title")}
                helperText={hasError(formState, "title") ? String(formState.errors["title"]) : ""}
                {...formState.getFieldProps("title")} // Sets the onChange function to a function that updates the form state
            ></TextField>
            <Autocomplete
                id="tags"
                multiple
                options={tagSuggestions || Array(0)}
                value={formState.values["tags"]}
                onChange={(event, newValue) => {
                    formState.setFieldValue("tags", newValue)
                }}
                onBlur={(e) => { 
                  formState.setFieldTouched("tags", true) 
                }}
                autoSelect                
                freeSolo
                renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id="tags"
                      name="tags"
                      variant="outlined"
                      label="Tags (Pick a suggestion or add your own!)"
                      error={hasError(formState, "tags")}
                      helperText={hasError(formState, "tags") ? String(formState.errors["tags"]) : ""}                                       
                    />
                  )}
            />
            <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
              <MDXEditor
                ref={mdxEditorRef}
                markdown={formState.values["body"]}
                className={styles["post-editor"]}
                placeholder="Body"
                plugins={[
                  listsPlugin(),
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        {' '}
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                        <ListsToggle/>
                      </>
                    )
                  })
                ]}
                onChange={(markdown) => formState.setFieldValue("body", markdown)}
                onBlur={() => formState.setFieldTouched("body", true)}
              />
              <DialogContentText color="#d32f2f" fontSize={12} sx={{visibility: hasError(formState, "body") ? "visible" : "hidden", mx: 2}}>
                  {/*White space is appended to the end of the error to ensure 
                  that the component is always inserted into the dom tree*/}
                  {`${formState.errors["body"]} `}
              </DialogContentText>              
            </Box>
        </Box>
    )
}