import { combineReducers } from 'redux'
import authReducers from './authReducers'


export default combineReducers({
    authReducers: authReducers,
})