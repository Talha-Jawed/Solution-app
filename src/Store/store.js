import { createStore, applyMiddleware } from 'redux';
import rootReudcer from './reducers';
import thunk from 'redux-thunk'

const store = createStore(
    rootReudcer,
    {},
    applyMiddleware(thunk))
export default store;