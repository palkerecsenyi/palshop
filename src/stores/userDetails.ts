import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { httpsCallable } from "firebase/functions"
import { useEffect } from "react"
import { AccountSettings } from "../data/account"
import { WithId } from "../data/types"
import { getAppFunctions } from "../data/util"
import { useAppDispatch } from "./hooks"

interface UserDetailsState {
    invoiceEmail: string
    balance: number
    stripeLoading: boolean

    settings: WithId<AccountSettings>
    settingsLoading: boolean
}

const initialState: UserDetailsState = {
    invoiceEmail: "",
    balance: 0,
    stripeLoading: true,

    settings: {
        id: "",
        autoCharge: false,
        compensationMethod: "credit",
    },
    settingsLoading: true,
}

export const fetchUserDetails = createAsyncThunk(
    "userDetails/fetchUserDetails",
    async () => {
        const functions = getAppFunctions()
        const f = httpsCallable<undefined, {
            balance: number,
            email: string,
        }>(functions, "getDetails")
        const response = await f()
        return response.data
    }
)

export const userDetailsSlice = createSlice({
    name: "userDetails", 
    initialState,
    reducers: {
        updateSettings(state, action: PayloadAction<WithId<AccountSettings> | undefined>) {
            if (action.payload) {
                state.settings = action.payload
            }
            state.settingsLoading = false
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchUserDetails.fulfilled, (state, action) => {
            state.invoiceEmail = action.payload.email
            state.balance = action.payload.balance
            state.stripeLoading = false
        })
    }
})

export const useUserDetails = () => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchUserDetails())
    }, [dispatch])
}

export const {updateSettings} = userDetailsSlice.actions
export default userDetailsSlice.reducer
