import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import CreateIcon from '@mui/icons-material/Create';
import DraftsIcon from '@mui/icons-material/Drafts';
import ArticleIcon from '@mui/icons-material/Article';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CommentIcon from '@mui/icons-material/Comment';
import { FC } from "react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clickedLogin } from "../popups/popup_slice";

const nav = [
    {label: "Home", path: "/", icon: <HomeIcon style={{ fill: "#51361a" }} />},
    {label: "Create Post", path: "/create", icon: <CreateIcon style={{ fill: "#51361a" }}/>},
    {label: "My Drafts", path: "/my-drafts", icon: <DraftsIcon style={{ fill: "#51361a" }}/>},
    {label: "My Posts", path: "/my-posts", icon: <ArticleIcon style={{ fill: "#51361a" }}/>},
    {label: "My Comments", path: "/my-comments", icon: <CommentIcon style={{ fill: "#51361a" }}/>},
    {label: "Liked Posts", path: "/liked-posts", icon: <ThumbUpOffAltIcon style={{ fill: "#51361a" }}/>},
    {label: "Liked Comments", path: "/liked-comments", icon: <ThumbUpOffAltIcon style={{ fill: "#51361a" }}/>},
]

export const SideBar: FC = () => {
    const router = useRouter() 

    // If the user clicked any page except the home page and has not logged in, 
    // redirect them to the login popup
    const authenticated = useAppSelector((state) => state.session.authenticated)
    const dispatch = useAppDispatch()
    const onClick = (path: string) => {
      if (path != "/" && !authenticated) {
          dispatch(clickedLogin())
          return
      }

      router.push(path)
    }

    return (
        <Drawer
        variant="permanent"
        sx={{
          width: "240px",
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: "240px", boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
            <List>
            {nav.map((page) => (
                <ListItem key={page.label} disablePadding>
                <ListItemButton onClick={() => onClick(page.path)}>
                    <ListItemIcon>{page.icon}</ListItemIcon>
                    <ListItemText primary={page.label} sx={{color: "#51361a"}} />
                </ListItemButton>
                </ListItem>
            ))}
            </List>
        </Box>
      </Drawer>
    )
}