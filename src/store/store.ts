import { configureStore } from "@reduxjs/toolkit";
import exampleReducer from "./reducers/example.reducer";

export const store = configureStore({
  reducer: {
    example: exampleReducer,
    // Adicione outros reducers aqui conforme necessário
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;