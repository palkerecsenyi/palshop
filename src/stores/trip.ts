import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Trip } from "../data/trips";
import type { WithId } from "../data/types";

interface TripState {
    currentTrip?: WithId<Trip>
    loading: boolean
}

const initialState: TripState = {
    currentTrip: undefined,
    loading: true,
}

export const tripsSlice = createSlice({
    name: "trip",
    initialState,
    reducers: {
        updateTrip(state, action: PayloadAction<WithId<Trip>>) {
            state.currentTrip = action.payload
            state.loading = false
        },
        clearTrip(state) {
            state.currentTrip = undefined
            state.loading = false
        }
    }
})

export const {updateTrip, clearTrip} = tripsSlice.actions
export default tripsSlice.reducer
