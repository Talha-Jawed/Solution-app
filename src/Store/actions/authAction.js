import actionTypes from '../Constant/Constant'
import firebase from '../../Config/firebase/index'


// Fb LogIn
export function fb_Action(type, token) {
    return dispatch => {
        if (type === 'success') {
            const credential = firebase.auth.FacebookAuthProvider.credential(token)

            firebase.auth().signInAndRetrieveDataWithCredential(credential).then((success) => {
                console.log(success.additionalUserInfo.profile.name, 'success******');
                var currentUID = success.user.uid
                var obj = {
                    Name: success.additionalUserInfo.profile.name,
                    UID: success.user.uid,
                    image: success.user.photoURL,
                    // Token: token
                }
                firebase.database().ref('/UserData/' + currentUID).update(obj);

            })
                .catch((error) => {
                    console.log(error, '********');
                    alert(error)
                })
        } else {
            type === 'cancel'
        }
    }
}


// Google LogIn
export function Google_Action(currentUID, obj) {
    return dispatch => {
        dispatch(
            { type: actionTypes.UID, payload: currentUID }
        )
        dispatch(
            { type: actionTypes.USER, payload: obj }
        )
    }
}


// Update UserInfo
export function info_send(currentUID) {
    return dispatch => {
        if (currentUID) {
            firebase.database().ref('/UserData/').on('child_added', snapshot => {
                if (snapshot.key === currentUID) {
                    console.log(snapshot.val(), '--==---=');

                    const obj = snapshot.val()
                    dispatch(
                        { type: actionTypes.USER, payload: obj }
                    )
                }
            })
        }
    }
}


// Refresh
export function Refresh(currentUser) {
    return dispatch => {
        var arr = [];
        firebase.database().ref('/UserData/').on('child_added', snapShot => {
            const UserData = snapShot.val();
            if (snapShot.key === currentUser.uid) {
                dispatch(
                    { type: actionTypes.USER, payload: snapShot.val() }
                )
            }
            else {
                arr.push(snapShot.val())
                dispatch(
                    { type: actionTypes.ALLUSER, payload: arr }
                )
            }
        })
    }
}


// current User
export function current_User(currentUser) {
    return dispatch => {
        const UID = currentUser.uid
        var arr = [];
        var SendRequest = [];
        var ReceiveRequest = [];
        dispatch(
            { type: actionTypes.UID, payload: UID }
        )

        // USERS
        firebase.database().ref('/UserData/').on('child_added', snapShot => {
            const UserData = snapShot.val();
            if (snapShot.key === currentUser.uid) {
                dispatch(
                    { type: actionTypes.USER, payload: snapShot.val() }
                )
            }
            else {
                arr.push(snapShot.val())
                dispatch(
                    { type: actionTypes.ALLUSER, payload: arr }
                )
            }
        })

        // Request
        firebase.database().ref('/Request/').on('child_added', snapshot => {
            for (var key in snapshot.val()) {
                var value = snapshot.val()[key];

                if (value.data.UID === UID) {
                    SendRequest.push(value)
                }
                if (snapshot.key === UID) {
                    ReceiveRequest.push(value)
                }
            }
        })

        // SEND REQUEST
        dispatch(
            { type: actionTypes.SENDREQUEST, payload: SendRequest }
        )

        // RECEIVE REQUEST
        dispatch(
            { type: actionTypes.RECEIVEREQUEST, payload: ReceiveRequest }
        )

        // MESSAGES
        var arr = [];
        var flag
        var chatMessages = []
        firebase.database().ref('/Messages/').on('child_added', snapShot => {
            const Messages = snapShot.val();
            flag = !flag
            if (Messages.senderUid === UID || Messages.reciverUid === UID) {
                // console.log("user", snapShot.val())
                chatMessages.push(Messages)
                dispatch(
                    { type: actionTypes.CHAT, payload: chatMessages }
                )
            }
            dispatch(
                { type: actionTypes.FLAG, payload: flag }
            )
        })
    }
}


// LOG OUT
export function _logOut() {
    console.log('logOut****');
    
    return dispatch => {
        firebase.auth().signOut().then(() => {
            dispatch(
                { type: actionTypes.UID, payload: null }
            )
            dispatch(
                { type: actionTypes.USER, payload: null }
            )
            dispatch(
                { type: actionTypes.ALLUSER, payload: null }
            )
            dispatch(
                { type: actionTypes.RECEIVEREQUEST, payload: null }
            )
            dispatch(
                { type: actionTypes.SENDREQUEST, payload: null }
            )
            dispatch(
                { type: actionTypes.CHAT, payload: null }
            )
        })
    }
}
