import { FC, PropsWithChildren } from 'react';

import { Box } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { userIsLoggedIn } from '../auth/auth';
import { KeywordFilter } from './keyword_filter';
import { LoginSignUpButtons } from './login_signup_buttons';
import { LogoutButton } from './logout_button';
import { TagFilter } from './tag_filter';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppDispatch } from '@/redux/hooks';
import { clickedMenu } from '../sidebar/sidebar_slice';
import styles from "./topbar.module.css"


export const Topbar: FC<PropsWithChildren> = () => {
    const authenticated = userIsLoggedIn()
    const dispatch = useAppDispatch()

    return (
        <>
            <AppBar position='fixed' sx={{borderColor: "#AEAEAE", backgroundColor: "white", zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar 
                    className={`${styles["topbar-padding"]} ${styles["topbar-height"]}`} 
                    sx={{display: 'flex', justifyContent: 'space-between'}}
                >
                    <Typography 
                        variant='h5' 
                        color="darkBrown"
                        className='hide-on-xs show-on-medium'
                    >
                        NUSConfessITFake
                    </Typography>
                    <Box className='show-on-xs hide-on-medium'>
                        <MenuIcon 
                            onClick={() => dispatch(clickedMenu())}
                            sx={{color: 'black'}}
                        />
                    </Box>
                    <Box className={styles["filter-group"]}>
                        <KeywordFilter/>
                        <TagFilter/>
                    </Box>
                    { authenticated 
                        ? <LogoutButton/>
                        : <LoginSignUpButtons/>
                    }
                </Toolbar>
            </AppBar>
        </>
    )
}