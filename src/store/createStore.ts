import { configureStore } from "@reduxjs/toolkit"
import api from "@/store/api"
import rootReducer from "@/store/rootReducer"

function createStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
        preloadedState
    })
}

export default createStore
