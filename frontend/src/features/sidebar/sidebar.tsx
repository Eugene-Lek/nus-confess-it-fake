import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import CreateIcon from '@mui/icons-material/Create';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeIcon from '@mui/icons-material/Home';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { useRouter } from "next/router";
import { FC } from "react";
import styles from "../topbar/topbar.module.css"
import { clickedMenu } from './sidebar_slice';

const nav = [
    {label: "Home", path: "/", icon: <HomeIcon color="darkBrown"/>},
    {label: "Create Post", path: "/create", icon: <CreateIcon color="darkBrown"/>},
    {label: "My Drafts", path: "/my-drafts", icon: <DraftsIcon color="darkBrown"/>},
    {label: "My Posts", path: "/my-posts", icon: <ArticleIcon color="darkBrown"/>},
    {label: "My Comments", path: "/my-comments", icon: <CommentIcon color="darkBrown"/>},
    {label: "Liked Posts", path: "/liked-posts", icon: <ThumbUpOffAltIcon color="darkBrown"/>},
    {label: "Liked Comments", path: "/liked-comments", icon: <ThumbUpOffAltIcon color="darkBrown"/>},
]

const SideBarContents = () => {
  const router = useRouter() 
  const dispatch = useAppDispatch()

  const onClick = (path: string) => {
     dispatch(clickedMenu())    
     router.push(path)
  }

  return (
    <>
        <Toolbar className={`${styles["topbar-padding"]} ${styles["topbar-height"]}`}/>
        <Box sx={{ overflow: 'auto' }}>
            <List>
            {nav.map((page) => (
                <ListItem key={page.label} disablePadding>
                <ListItemButton onClick={() => onClick(page.path)}>
                    <ListItemIcon>{page.icon}</ListItemIcon>
                    <ListItemText 
                      primary={page.label} 
                      slotProps={{
                        primary: {
                          color: "darkBrown"
                        }
                      }}/>
                </ListItemButton>
                </ListItem>
            ))}
            </List>
        </Box>    
    </>    
  )  
}

export const SideBar: FC = () => {
    const open = useAppSelector(state => state.sideBar.open)
    const dispatch = useAppDispatch()

    return (
      <>
        <Drawer
          variant="permanent"
          className='hide-on-xs show-on-medium'
          sx={{
            width: "240px",
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: "240px", boxSizing: 'border-box' },
          }}
        >
          <SideBarContents/>
        </Drawer>   
        <Drawer
          variant="temporary"
          open={open}
          className='show-on-xs hide-on-medium'
          sx={{
            width: "240px",
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: "240px", boxSizing: 'border-box' },
          }}
          onClose={() => {dispatch(clickedMenu())}}
        >
          <SideBarContents/>
        </Drawer>             
      </>
    )
}