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


export const Topbar: FC<PropsWithChildren> = () => {
    const authenticated = userIsLoggedIn()

    return (
        <>
            <AppBar position='fixed' sx={{borderColor: "#AEAEAE", backgroundColor: "white", zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography 
                        variant='h5' 
                        color="space"
                        sx={{display: {xs: "none", sm: "none", md: "block", lg: "block"}}}
                    >
                        NUSConfessITFake
                    </Typography>
                    <Box sx={{ display: 'flex', gap: "20px", alignItems: "center"}}>
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