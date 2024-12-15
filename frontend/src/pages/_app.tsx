import type { AppProps } from "next/app";
import { Provider } from 'react-redux';
import { Store } from '../redux/store';
import { Topbar } from "@/features/topbar/topbar";
import { SideBar } from "@/features/sidebar/sidebar";
import { ThemeProvider } from "@mui/material";
import { PopUp } from "@/features/popups/popup";
import { Theme } from "@/styles/mui_theme";
import { BodyContainer } from "@/features/global/BodyContainer";

export default function App({ Component: Body, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={Theme}>
      <Provider store={Store}>
        <PopUp/>
        <Topbar/>
        <SideBar/>
        <BodyContainer> 
          <Body {...pageProps} />
        </BodyContainer>
      </Provider>
    </ThemeProvider>
  )

}
