import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShopMetadata } from "../data/shops";
import { WithId } from "../data/types";

interface ShopsState {
    shops: WithId<ShopMetadata>[]
    loading: boolean
}

const initialState: ShopsState = {
    shops: [],
    loading: true,
}

export const shopsSlice = createSlice({
    name: "shops",
    initialState,
    reducers: {
        updateShops(state, action: PayloadAction<WithId<ShopMetadata>[]>) {
            state.shops = action.payload
            state.loading = false
        }
    }
})

export const {updateShops} = shopsSlice.actions
export default shopsSlice.reducer
