// Root layout is defined separately instead of inside the _app file so that 
// it can be imported in the _app file as a non-ssr component
// This is necessary to avoid hydration errors that only occur during development
// because the dev server always prerenders components but some components rely on
// localStorage, which only exists in the client.

import { ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { PopUp } from "../popups/popup";
import { Topbar } from "../topbar/topbar";
import { SideBar } from "../sidebar/sidebar";
import { BodyContainer } from "./BodyContainer";
import { Theme } from "@/styles/mui_theme";
import { Store } from "@/redux/store";

export default function RootAppLayout({ Component: Body, pageProps }: any) {
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