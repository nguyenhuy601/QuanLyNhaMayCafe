import { createSlice } from "@reduxjs/toolkit"

const initialValue = {
    user: null,
    token: null
}

const UserSlice = createSlice({
    initialState: initialValue,
    name: 'user',
    reducers: {
        loginUser: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
        },
        removeUser: (state) => {
            state.user = null
            state.token = null
        },
        updateUser: (state, action) => {
            state.user = action.user
        }
    }
})

export const { loginUser, removeUser, updateUser } = UserSlice.actions
export default UserSlice.reducer