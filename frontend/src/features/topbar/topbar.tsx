import { FC, PropsWithChildren } from 'react'

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';
import { LoginButton } from './login_button';
import { SignUpButton } from './signup_button';
import { KeywordFilter } from './keyword_filter';
import { TagFilter } from './tag_filter';
import { useAppSelector } from '@/redux/hooks';
import { LogoutButton } from './logout_button';
import { userIsLoggedIn } from '../auth/auth';


export const Topbar: FC<PropsWithChildren> = () => {
    const authenticated = userIsLoggedIn()

    return (
        <>
            <AppBar position='fixed' sx={{borderColor: "#AEAEAE", backgroundColor: "white", zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Typography variant='h5' color="space">NUSConfessITFake</Typography>
                    <Box sx={{ display: 'flex', gap: "20px", alignItems: "center"}}>
                        <KeywordFilter/>
                        <TagFilter/>
                    </Box>
                    { authenticated 
                        ? <LogoutButton/>
                        : <Box sx={{ display: 'flex', gap: "20px"}}>
                            <LoginButton/>
                            <SignUpButton/>
                          </Box>
                    }
                </Toolbar>
            </AppBar>
        </>
    )
}