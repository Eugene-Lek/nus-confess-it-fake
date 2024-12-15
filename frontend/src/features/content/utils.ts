import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';

export const Textarea = styled(BaseTextareaAutosize)(
    () => `
    font-family: Roboto;
    font-size: 16px;
    font-weight: normal;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
 `,
);

export const formatDate = (date: Date) => {
    const userLocale = Intl.NumberFormat().resolvedOptions().locale
    return (date).toLocaleString(userLocale, {
        year: "2-digit",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      }).toUpperCase() 
      
      // To uppercase is required because the server's implementation 
      // of toLocaleString gives "pm" while the client's implementation
      // gives "PM".
      // This inconsistency leads to a react-hydration-error during
      // development
}
