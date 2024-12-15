import { FormikProps } from "formik";

export const hasError = (formState: FormikProps<any>, field: string) : boolean => {
    // An error has occurred only if the user has touched the field
    return !!formState.errors[field] && !!formState.touched[field]
}