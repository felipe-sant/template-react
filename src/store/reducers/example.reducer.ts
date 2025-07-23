import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import ExampleType from "../../types/reducers/Example.type";

const initialState: ExampleType = {
    // adicione novos campos aqui.
}

const exampleSlice = createSlice({
    name: "example",
    initialState,
    reducers: {
        // Adicione reducers aqui
    },
    extraReducers: (builder: ActionReducerMapBuilder<ExampleType>) => {
        // Adicione extra reducers aqui
    }
})

export const { } = exampleSlice.actions
export default exampleSlice.reducer;

export { exampleSlice };