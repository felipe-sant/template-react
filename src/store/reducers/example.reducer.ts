import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import exampleState from "./example.state";
import ExampleType from "../../types/reducers/Example.type";

const exampleSlice = createSlice({
    name: "example",
    initialState: exampleState,
    reducers: {
        setName: (state: ExampleType, action: PayloadAction<string>) => {
            state.name = action.payload
        }
    },
    extraReducers: (builder: ActionReducerMapBuilder<ExampleType>) => {

    }
})

const exampleReducer = exampleSlice.reducer

export const { setName } = exampleSlice.actions
export default exampleReducer