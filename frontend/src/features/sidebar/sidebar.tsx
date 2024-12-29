import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import CreateIcon from '@mui/icons-material/Create';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeIcon from '@mui/icons-material/Home';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { useRouter } from "next/router";
import { FC } from "react";

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

    const onClick = (path: string) => {
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