import { configureStore } from "@reduxjs/toolkit";
import tripsReducer from "./trip"
import shopsReducer from "./shops"
import otherUsersReducer from "./otherUsers"
import userDetailsReducer from "./userDetails"
import historicTripsReducer from "./historicTrips"

export const appStore = configureStore({
    reducer: {
        tripsReducer,
        shopsReducer,
        otherUsersReducer,
        userDetailsReducer,
        historicTripsReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoreState: true,
                ignoreActions: true,
            }
        })
})
export type RootState = ReturnType<typeof appStore.getState>
export type AppDispatch = typeof appStore.dispatch

