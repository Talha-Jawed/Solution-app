import actionTypes from '../Constant/Constant'

const INITIAL_STATE = {
    UID: null,
    USER: null,
    ALLUSER: null,
    RECEIVEREQUEST: null,
    SENDREQUEST: null,
    CHAT: null,
    FLAG: false
}

export default (states = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'UID':
            return ({
                ...states,
                UID: action.payload
            })
        case 'USER':
            return ({
                ...states,
                USER: action.payload
            })
        case 'ALLUSER':
            return ({
                ...states,
                ALLUSER: action.payload
            })
        case 'RECEIVEREQUEST':
            return ({
                ...states,
                RECEIVEREQUEST: action.payload
            })
        case 'SENDREQUEST':
            return ({
                ...states,
                SENDREQUEST: action.payload
            })
        case 'CHAT':
            return ({
                ...states,
                CHAT: action.payload
            })
        case 'FLAG':
            return ({
                ...states,
                FLAG: action.payload
            })

        default:
            return states;
    }
}