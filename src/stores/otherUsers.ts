import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { httpsCallable } from "firebase/functions";
import { useEffect } from "react";
import { getAppFunctions } from "../data/util";
import { useAppDispatch, useAppSelector } from "./hooks";

export interface OtherUserDetail {
    id: string
    name: string
}

interface OtherUsersContext {
    otherUsers: OtherUserDetail[]
    loading: boolean
}

const initialState: OtherUsersContext = {
    otherUsers: [],
    loading: true,
}

export const fetchOtherUsers = createAsyncThunk(
    "otherUsers/fetchOtherUsers", 
    async () => {
        const functions = getAppFunctions()
        const f = httpsCallable<undefined, OtherUserDetail[]>(functions, "getOtherUserList")
        const response = await f()
        return response.data
    }
)

export const otherUsersSlice = createSlice({
    name: "otherUsers",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchOtherUsers.fulfilled, (state, action) => {
            state.otherUsers = action.payload
            state.loading = false
        })
    }
})

export const useOtherUsers = () => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchOtherUsers())
    }, [dispatch])
}
export const useOtherUsersSelector = () => useAppSelector(state => state.otherUsersReducer.otherUsers)

export default otherUsersSlice.reducer
