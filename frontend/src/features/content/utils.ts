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

export const removeNewlines = (body: string) => {
    return body.replaceAll("\n", " ")
}

export const convertToMarkdown = (body: string) => {
    return body.replaceAll("\n", "\n\n")
}
