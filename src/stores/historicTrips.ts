import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, getDocs, getFirestore, orderBy, query, Timestamp, where } from "firebase/firestore";
import { useEffect } from "react";
import { Trip, TripConverter } from "../data/trips";
import type { WithId } from "../data/types";
import { useAppDispatch } from "./hooks";
import type { AppDispatch, RootState } from "./stores";

interface HistoricTripsState {
    trips: WithId<Trip>[]
    tripsLoading: boolean
}

const initialState: HistoricTripsState = {
    trips: [],
    tripsLoading: true,
}

export const fetchHistoricTrips = createAsyncThunk<WithId<Trip>[], void, {
    state: RootState,
    dispatch: AppDispatch
}>(
    "historicTripsSlice/fetchHistoricTrips",
    async (_, thunkAPI) => {
        const state = thunkAPI.getState()
        const alreadyDone = state.historicTripsReducer.tripsLoading === false
        if (alreadyDone) {
            return state.historicTripsReducer.trips
        }

        const firestore = getFirestore()
        const q = query(
            collection(firestore, "trips"),
            where("itemsDeadline", "<", Timestamp.now()),
            orderBy("itemsDeadline", "desc"),
        ).withConverter(TripConverter)

        const response = await getDocs(q)
        return response.docs.map(e => e.data())
    }
)

export const historicTripsSlice = createSlice({
    name: "historicTrips",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchHistoricTrips.fulfilled, (state, action) => {
            state.trips = action.payload
            state.tripsLoading = false
        })
    }
})

export const useHistoricTrips = () => {
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(fetchHistoricTrips())
    }, [dispatch])
}

export default historicTripsSlice.reducer
