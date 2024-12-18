import { Autocomplete, Box, Button, Chip, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { MDXEditor, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin, CreateLink, linkPlugin, linkDialogPlugin } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import styles from "../../styles/post-editor.module.css"

export const PostEditor = () => {
    // TODO: get tags via API call
    let tagOptions = ["Math", "CS", "Campus", "Hall", "CCAs"]

    const [tags, setTags] = useState(Array(0))

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px", px:"40px", paddingTop: "30px", paddingBottom:"200px"}}>
            <Typography variant="h5" fontWeight={"bold"} color="space">Create Post</Typography>
            <TextField 
                label="Title" 
                variant="outlined" 
                size="small" 
                rows={1}
            ></TextField>
            <Autocomplete
                multiple
                options={tagOptions}
                onChange={(event, newValue) => {
                    setTags([...tags, newValue])
                }}
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
                      variant="outlined"
                      label="Tags"
                    />
                  )}
            />
            <MDXEditor
              markdown=""
              className={styles["body-editor"]}
              placeholder="Body"
              plugins={[
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      {' '}
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                    </>
                  )
                })
              ]}
            />
            <Box sx={{display:"flex", gap:"20px", marginLeft: "auto", marginRight: 0}}>
              <Button variant="contained" color="khaki">Save Draft</Button>
              <Button variant="contained" color="khaki">Post</Button>
            </Box>
        </Box>
    )
}