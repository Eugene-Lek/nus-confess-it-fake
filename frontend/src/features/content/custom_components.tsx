/* eslint-disable @typescript-eslint/no-unused-vars */

import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import Markdown from 'react-markdown'
import { Box, styled, SxProps } from '@mui/system';
import { FC, PropsWithChildren, ReactNode } from 'react';
import rehypeRaw from 'rehype-raw';
import styles from "./content.module.css"

export const Textarea = styled(BaseTextareaAutosize)(
    () => `
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-weight: normal;
    font-size: 0.875rem;
    line-height: 1.43;
    letter-spacing: 0.01071em;
    padding: 8px 12px;
    border-radius: 8px;
 `,
);

interface MarkdownBodyProps {
    children?: ReactNode | undefined
    sx?: SxProps
}

export const MarkdownBody: FC<MarkdownBodyProps> = ({children, sx}) => {
    return (
        <Box sx={{...sx, display: "flex", flexDirection: "column", gap: "10px"}}>
            <Markdown components={{
                p(props) {
                    const {node, ...rest} = props
                    return <p className={styles.body} {...rest}/>
                },
                strong(props) {
                    const {node, ...rest} = props
                    return <strong className={styles.body} {...rest}/>
                },
                em(props) {
                    const {node, ...rest} = props
                    return <em className={styles.body} {...rest}/>
                },
                u(props) {
                    const {node, ...rest} = props
                    return <u className={styles.body} {...rest}/>
                },
                li(props) {
                    const {node, ...rest} = props
                    return <li className={styles.body} {...rest}/>
                },
                ol(props) {
                    const {node, ...rest} = props
                    return <ol style={{margin: 0}} {...rest}/>
                }                        
            }} rehypePlugins={[rehypeRaw]}>{String(children)}</Markdown>
        </Box>
    )
}