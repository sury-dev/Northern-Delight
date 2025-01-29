import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../slices/authSlice.js'

const store = configureStore({
    reducer: {
        auth: authReducer
        // posts: postsReducer
    }
})

export default store