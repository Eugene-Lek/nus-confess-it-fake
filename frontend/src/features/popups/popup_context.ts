// Used to store functions in the state since using redux to do so is not recommended

import { TypedMutationTrigger } from '@reduxjs/toolkit/query/react';
import { createContext, Dispatch, SetStateAction } from 'react';

interface props {
    deleteQueryFunc: TypedMutationTrigger<any, any, any> | null
    setDeleteQueryFunc:  Dispatch<SetStateAction<TypedMutationTrigger<any, any, any> | null>> | null
}

export const PopUpContext = createContext<props>({deleteQueryFunc: null, setDeleteQueryFunc: null})