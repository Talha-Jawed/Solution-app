import React from 'react';
import { View, ScrollView, Text, StyleSheet, Image } from 'react-native';
import { connect } from 'react-redux'
import firebase from 'firebase'
import { Header } from 'react-native-elements';


class RequestList extends React.Component {
    constructor() {
        super()
        this.state = {
            request: [],
            _request: false,
            UID: '',
            buyerUID: '',
            Panding: false,
            Delete: false
        }
    }
    componentDidMount() {
        const { CurrentUser, UID, ReceiveRequest } = this.props
        var allRequest = []
        if (ReceiveRequest && UID) {
            ReceiveRequest.map(item => {
                if (item) {
                    allRequest.push({ item })
                }
                this.setState({ request: allRequest, _request: true, UID, buyerUID: item.data.UID })
                var buyerUID = item.data.UID

                // firebase.database().ref('/Request/' + UID).on('child_changed', (snapShot) => {
                //     if (snapShot.key === buyerUID) {
                //         // console.log(snapShot.val(), '=====///>>')
                //         if (snapShot.val().status === 'Accept') {
                //             this.setState({ Panding: false })
                //         } else if (snapShot.val().status === 'Panding') {
                //             this.setState({ Panding: true })
                //         } else if (snapShot.val().status === 'Delete') {
                //             this.setState({ Delete: true })
                //         }
                //     }

                // })

                // firebase.database().ref('/Request/' + UID).on('child_added', (snapShot) => {
                //     if (snapShot.key === buyerUID) {
                //         // console.log(snapShot.val(), '=====///>>')
                //         if (snapShot.val().status === 'Accept') {
                //             this.setState({ Panding: false })
                //         } else if (snapShot.val().status === 'Panding') {
                //             this.setState({ Panding: true })
                //         } else if (snapShot.val().status === 'Delete') {
                //             this.setState({ Delete: true })
                //         }
                //     }

                // })
            })
        }
    }

    back() {
        this.props.navigation.navigate('Home')
    }

    view(item) {
        this.props.navigation.navigate('Offer', { item })
    }

    conform() {
        const { request, UID, buyerUID } = this.state
        var obj = {
            status: 'Accept'
        }

        firebase.database().ref('/Request/' + UID + '/' + buyerUID).update(obj);
    }

    delete() {
        const { UID, buyerUID } = this.state
        var obj = {
            status: 'Delete'
        }

        firebase.database().ref('/Request/' + UID + '/' + buyerUID).update(obj);
    }

    Contact(item) {
        // const { } = this.state
        // this.setState({ _offer: false })
        this.props.navigation.navigate('Chat', { item })
    }

    // Token(notification, name) {
    //     const { CurrentUser, UID } = this.state
    //     this.props.GetToken(CurrentUser, UID)
    //     this.setState({ token: true })
    //     fetch('https://exp.host/--/api/v2/push/send', {
    //         mode: 'no-cors',
    //         method: 'POST',
    //         headers: {
    //             "Accept": 'application/json',
    //             "Content-Type": 'application/json'
    //         },
    //         body: JSON.stringify({
    //             to: notification,
    //             body: 'Token Request',
    //             title: name,
    //         })
    //     });
    // }

    static navigationOptions = { header: null }

    render() {
        const { request, _request, UID, Delete, Panding } = this.state

        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="center"
                    // rightComponent={{ icon: 'add', color: 'white' }}
                    // centerComponent={{ text: 'POST SERVICES', style: { color: '#fff' } }}
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.back() }}

                />
                <ScrollView >
                    {_request &&
                        request.map((item, index) => {
                            return (
                                <View key={index} style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', backgroundColor: '#eff1f2', borderWidth: 0.3, borderColor: 'white' }} >
                                    <View style={{ padding: 8 }}>
                                        <Image style={styles.icon} source={{ uri: item.item.data.Photo }} />
                                    </View>
                                    <View style={{ flex: 1, paddingLeft: 5, marginRight: 0 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.titleName} onPress={() => this.view(item.item.data)}>{item.item.data.Name}</Text>
                                            <Text style={styles.price} onPress={() => this.view(item.item.data)}>{"$"+ item.item.Price}</Text>
                                        </View>
                                        <Text style={{ color: '#424c59' }}>Sent You a Offer</Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.btnAccept} onPress={() => this.Contact(item)} >Contact</Text>
                                            <Text style={styles.btnDlt} onPress={() => this.view(item.item.data)} >{' View '}</Text>
                                        </View>
                                        {/* {!Delete ?
                                            Panding ?
                                                <View>
                                                </View>
                                                :
                                                <View>
                                                    <Text style={{ color: '#424c59' }}>Offer Accepted</Text>
                                                    <View style={{ alignSelf: 'flex-start' }}>
                                                        <Text style={styles.btnContact} onPress={() => this.Contact(item)}>Contact..</Text>
                                                    </View>
                                                </View>
                                            :
                                            <Text style={{ color: '#ef3939' }}>Offer Rejected</Text>
                                        } */}
                                    </View>
                                </View>
                            )
                        })
                    }
                </ScrollView>
            </View >
        );
    }
}
const styles = StyleSheet.create({
    mainBtn: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#3498db",
        padding: 8,
        borderWidth: 2,
        marginTop: 8
    },
    icon: {
        height: 70,
        width: 70,
        borderRadius: 35,
        // paddingLeft: 30
    },
    titleName: {
        paddingTop: 8,
        paddingBottom: 2,
        fontSize: 16,
        fontWeight: '700',
    },
    btnAccept: {
        overflow: 'hidden',
        margin: 5,
        paddingHorizontal: 30,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#3498db',
        fontSize: 12,
        fontWeight: '700',
        // textDecorationLine: 'underline',
        color: '#ffffff',
        marginLeft: 0,
    },
    btnDlt: {
        margin: 5,
        borderWidth: 1,
        paddingHorizontal: 30,
        paddingVertical: 4,
        borderRadius: 6,
        borderColor: '#424c59',
        fontSize: 12,
        fontWeight: '700',
        // textDecorationLine: 'underline',
        color: '#424c59',
    },
    btnContact: {
        marginTop: 5,
        marginBottom: 5,
        // marginRight:30,
        borderWidth: 1,
        paddingHorizontal: 60,
        paddingVertical: 3,
        borderRadius: 6,
        borderColor: '#3498db',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
        color: '#3498db',
    },
    price: {
        paddingTop: 8,
        paddingBottom: 2,
        paddingRight: 8,
        fontSize: 16,
        fontWeight: '700',
        color: '#424c59'
    }
});

function mapStateToProps(states) {
    return ({
        UID: states.authReducers.UID,
        CurrentUser: states.authReducers.USER,
        alluser: states.authReducers.ALLUSER,
        ReceiveRequest: states.authReducers.RECEIVEREQUEST,
        SendRequest: states.authReducers.SENDREQUEST
    })
}

function mapDispatchToProps(dispatch) {
    return ({
        // userAuth: (Email, Password) => {
        //     dispatch(userAction(Email, Password));
        // }
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(RequestList);