import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import CreateIcon from '@mui/icons-material/Create';
import DraftsIcon from '@mui/icons-material/Drafts';
import ArticleIcon from '@mui/icons-material/Article';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { FC } from "react";
import { useRouter } from "next/router";

const nav = [
    {label: "Home", path: "/", icon: <HomeIcon/>},
    {label: "Create Post", path: "/create", icon: <CreateIcon/>},
    {label: "My Drafts", path: "/drafts", icon: <DraftsIcon/>},
    {label: "My Posts", path: "/posts", icon: <ArticleIcon/>},
    {label: "Liked Posts", path: "/liked-posts", icon: <ThumbUpOffAltIcon/>},
]

export const SideBar: FC = () => {
    const router = useRouter() 

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
            {nav.map((page, index) => (
                <ListItem key={page.label} disablePadding>
                <ListItemButton onClick={() => {router.push(page.path)}}>
                    <ListItemIcon>{page.icon}</ListItemIcon>
                    <ListItemText primary={page.label} />
                </ListItemButton>
                </ListItem>
            ))}
            </List>
        </Box>
      </Drawer>
    )
}