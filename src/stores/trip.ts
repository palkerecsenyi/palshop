import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { useEffect } from "react";
import { Cart, CartItem } from "../data/cart";
import { Price } from "../data/price";
import type { Trip } from "../data/trips";
import type { WithId } from "../data/types";
import { useAppDispatch } from "./hooks";

interface TripState {
    currentTrip?: WithId<Trip>
    tripLoading: boolean

    motd?: string
    motdLoading: boolean

    cart?: WithId<Cart>
    cartLoading: boolean

    cartItems: WithId<CartItem>[]
    cartItemsLoading: boolean

    allPrices: WithId<Price>[]
    allPricesLoading: boolean
}

const initialState: TripState = {
    currentTrip: undefined,
    tripLoading: true,

    motd: undefined,
    motdLoading: true,

    cart: undefined,
    cartLoading: true,

    cartItems: [],
    cartItemsLoading: true,

    allPrices: [],
    allPricesLoading: true,
}

export const fetchMotd = createAsyncThunk(
    "tripsSlice/fetchMotd",
    async () => {
        const url = process.env.REACT_APP_MOTD_URL
        if (url === undefined) {
            console.warn("No URL for the MotD service has been set.")
            return
        }

        const response = await axios.get<{
            available: boolean
            motd?: string
        }>(url)
        const data = response.data
        if (!data.available || !data.motd) {
            return undefined
        }

        return data.motd
    }
)

export const tripsSlice = createSlice({
    name: "trip",
    initialState,
    reducers: {
        updateTrip(state, action: PayloadAction<WithId<Trip>>) {
            state.currentTrip = action.payload
            state.tripLoading = false
        },
        clearTrip(state) {
            state.currentTrip = undefined
            state.tripLoading = false
        },

        updateCart(state, action: PayloadAction<WithId<Cart>>) {
            state.cart = action.payload
            state.cartLoading = false
        },
        clearCartCache(state) {
            state.cart = undefined
            state.cartLoading = false
        },

        updateCartItems(state, action: PayloadAction<WithId<CartItem>[]>) {
            state.cartItems = action.payload
            state.cartItemsLoading = false
        },

        updateAllPrices(state, action: PayloadAction<WithId<Price>[]>) {
            state.allPrices = action.payload
            state.allPricesLoading = false
        }
    },
    extraReducers: builder => {
        builder.addCase(fetchMotd.fulfilled, (state, action) => {
            state.motd = action.payload
            state.motdLoading = false
        })
    }
})

export const useMotd = () => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchMotd())
    }, [dispatch])
}

export const {updateTrip, clearTrip, updateCart, clearCartCache, updateCartItems, updateAllPrices} = tripsSlice.actions
export default tripsSlice.reducer
