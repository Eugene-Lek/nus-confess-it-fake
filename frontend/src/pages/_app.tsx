import type { AppProps } from "next/app";
import dynamic from 'next/dynamic'
import '../styles/global.css'; // Used to make the scroll bar permenant


// Root layout is defined separately instead of inside the _app file so that 
// it can be imported in the _app file as a non-ssr component
// This is necessary to avoid hydration errors that only occur during development
// because the dev server always prerenders components but some components rely on
// localStorage, which only exists in the client.

const NoSSRRootAppLayout = dynamic(() => import("@/features/root/RootAppLayout"), { ssr: false })

export default function App({ Component: Body, pageProps }: AppProps) {
  return <NoSSRRootAppLayout Component={Body} pageProps={pageProps}/>
}
