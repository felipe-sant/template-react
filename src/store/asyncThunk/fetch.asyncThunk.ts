import { createAsyncThunk } from "@reduxjs/toolkit";

const fetchAsyncThunk = createAsyncThunk(
    'example/fetch',
    () => {}    // função exemplo
)

export default fetchAsyncThunk