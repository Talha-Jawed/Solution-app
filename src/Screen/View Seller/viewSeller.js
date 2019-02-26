import React from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import firebase from 'firebase'
import { connect } from 'react-redux'
import { Header, Button, Rating } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

class ViewSeller extends React.Component {
    constructor() {
        super()
        this.state = {
            CurrentUser: '',
            item: '',
            ReceiveRequest: '',
            SellerUID: '',
            Panding: false,
            Accept: false,
            price: '',
            _offer: false,
            stars: false
        }
    }

    componentDidMount() {
        const { CurrentUser, navigation, UID, SendRequest, ReceiveRequest } = this.props;
        const seller = navigation.getParam('item')
        if (SendRequest) {
            setTimeout(() => {
            }, 1000)
        }
        if (seller) {
            if (seller.Name) {
                this.setState({
                    CurrentUser: CurrentUser,
                    item: seller,
                    SellerUID: seller.UID,
                    UID
                })
                var sellerUID = seller.UID
            }
            else if (seller.item.Name) {
                this.setState({
                    CurrentUser: CurrentUser,
                    item: seller.item,
                    SellerUID: seller.item.UID,
                    UID
                })
                var sellerUID = seller.item.UID
            }
        }
        if (SendRequest) {
            SendRequest.map(item => {
                if (item.SellerUID === sellerUID) {
                    if (item.status === 'Panding') {
                        this.setState({ Panding: true })
                    } else if (item.status === 'Accept') {
                        this.setState({ Accept: true })
                    } else if (item.status === 'Delete') {
                        this.setState({ Panding: false, Accept: false })
                    }
                }
            })
        }
        firebase.database().ref('/Request/' + sellerUID).on('child_changed', (snapShot) => {
            if (snapShot.val().data.UID === UID) {
                console.log(snapShot.val(), '=====///>>')
                if (snapShot.val().status === 'Accept') {
                    this.setState({ Accept: true, Panding: false })
                } else if (snapShot.val().status === 'Panding') {
                    this.setState({ Panding: true })
                } else if (snapShot.val().status === 'Delete') {
                    this.setState({ Panding: false, Accept: false })
                }
            }

        })

        firebase.database().ref('/Request/' + sellerUID).on('child_added', (snapShot) => {
            if (snapShot.val().data.UID === UID) {
                console.log(snapShot.val(), '=====///>>')
                if (snapShot.val().status === 'Accept') {
                    this.setState({ Accept: true, Panding: false })
                } else if (snapShot.val().status === 'Panding') {
                    this.setState({ Panding: true })
                } else if (snapShot.val().status === 'Delete') {
                    this.setState({ Panding: false, Accept: false })
                }
            }

        })
    }

    componentWillReceiveProps(props) {
        const { CurrentUser, SendRequest, UID, ReceiveRequest } = props;
        console.log('sendReqWll==>', SendRequest);
        console.log('RecvReqWll==>', ReceiveRequest);
    }

    back() {
        this.setState({ _offer: false })
        this.props.navigation.navigate('Home')
    }

    direction() {
        this.props.navigation.navigate('Mapp', { userLocation })
    }

    request() {
        const { item, CurrentUser, UID } = this.state
        const sellerUID = item.UID
        const obj = {
            status: 'Panding',
            data: CurrentUser,
            SellerUID: sellerUID
        }
        firebase.database().ref('/Request/' + sellerUID + '/' + UID).update(obj);

    }

    Contact(item) {
        // const { } = this.state
        this.setState({ _offer: false })
        this.props.navigation.navigate('Chat', { item })
    }

    sendNotification = (token, Name) => {
        const { price } = this.state;
        console.log('notification', Name);
        fetch('https://exp.host/--/api/v2/push/send', {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                "Accept": 'application/json',
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                to: token,
                title: Name,
                body: `Price: ${price}$`,
            })
        });
    }

    offer() {
        this.setState({ _offer: true })
    }

    sendOffer() {
        const { item, CurrentUser, UID, price } = this.state
        const sellerUID = item.UID
        if (price.length > 2 || price.length < 1) {
            alert('Please Fill Correct Prize')
        } else {
            const obj = {
                status: 'Panding',
                data: CurrentUser,
                SellerUID: sellerUID,
                Price: price
            }
            this.sendNotification(token = item.expoToken, Name = CurrentUser.Name)
            firebase.database().ref('/Request/' + sellerUID + '/' + UID).update(obj);


        }
        this.setState({ _offer: false })
    }

    rating() {
        this.setState({ stars: true })
    }

    ratingCompleted = (rating) => {
        const { item, CurrentUser, UID } = this.state
        console.log("Rating is: " + rating)
        const sellerUID = item.UID
        this.setState({ stars: false })
        var obj = {
            Rating: rating
        }
        firebase.database().ref('/Rating/' + sellerUID + '/' + UID).update(obj);
    }

    static navigationOptions = { header: null }

    render() {
        const { item, Panding, Accept, _offer, stars } = this.state

        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="center"
                    rightComponent={{ icon: 'add', color: 'white', onPress: () => this.offer() }}
                    centerComponent={{ text: 'POST SERVICES', style: { color: '#fff' } }}
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.back() }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', backgroundColor: '#f2f6f9' }}>
                    <View style={{ padding: 20 }}>
                        <Image style={styles.icon} source={{ uri: item.Photo }} />
                    </View>
                    <View>
                        <Text style={styles.titleName}>{item.Name}</Text>
                        <Text style={{ color: '#424c59' }}>Not Rated..</Text>
                        <Text style={styles.btn} onPress={() => this.Contact(item)}>Contact..</Text>
                    </View>
                </View>
                {
                    _offer &&
                    this.MakeOffer()
                }
                <Text style={styles.heading}>User Information</Text>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.info}> <Icon name='calendar' size={25} color='gray' />{' Experience ' + item.experience + ' Year '} </Text>
                <Text style={styles.info}> <Icon name='phone' size={25} color='gray' />{' Phone # ' + item.number} </Text>
                <Text style={styles.info}> <Icon name='map-marker' size={25} color='gray' />{' From Karachi , Pakistan'} </Text>
                {
                    stars &&
                    <View style={{ justifyContent: 'center' }}>
                        <Rating
                            // showRating
                            onFinishRating={this.ratingCompleted}
                            style={{ paddingVertical: 10 }}
                        />
                    </View>
                }
                {
                    Panding ?
                        <Text style={styles.status}>Your Offer Status Pending</Text>
                        :
                        !Panding && Accept ?
                            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                <Text style={styles.btnDirection} onPress={() => this.direction(userLocation = item.where)}> <Icon name='map-marker' size={18} color='white' />{' Direction'}</Text>
                                <Text style={styles.btnRating} onPress={() => this.rating()} ><Icon name='star' size={18} color='white' />{' Rating'}</Text>
                            </View>
                            :
                            null
                }


            </View>
        );
    }

    MakeOffer() {
        const { price, item } = this.state
        return (
            <View style={{ justifyContent: 'center', marginTop: 2, flexDirection: 'row' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#3498db", paddingTop: 10 }}>{' Make Offer in '}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(e) => this.setState({ price: e })}
                    value={price}
                    placeholder={'1'}
                    // placeholderTextColor='rgba(255,255,255,0.7)'
                    autoFocus
                    keyboardType='numeric'
                />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#3498db", paddingTop: 10 }}>{' $ '}</Text>
                <Text style={styles.sendBtn} onPress={() => this.sendOffer()}>{' SEND '}</Text>
            </View>
        )
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 0,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    icon: {
        height: 90,
        width: 90,
        borderRadius: 45,
        // paddingLeft: 30
    },
    titleName: {
        paddingTop: 20,
        paddingBottom: 8,
        fontSize: 18,
        fontWeight: 'bold',
    },
    btn: {
        marginTop: 12,
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
    heading: {
        fontSize: 16,
        fontWeight: '700',
        paddingLeft: 10,
        paddingBottom: 10,
        paddingTop: 12,
    },
    category: {
        fontSize: 18,
        fontWeight: '500',
        paddingLeft: 12,
        paddingBottom: 12,
        paddingTop: 6,
        color: '#404954'
    },
    info: {
        paddingLeft: 12,
        paddingBottom: 10,
        paddingTop: 8,
        color: '#424c59',
        fontSize: 15,
        borderWidth: .3,
        borderColor: '#ced9e0'

    },
    input: {
        backgroundColor: 'rgba(99, 172, 221,0.5)',
        color: '#ffffff',
        width: 33,
        height: 40,
        borderRadius: 10,
        paddingLeft: 5,
        fontSize: 18,
    },
    sendBtn: {
        overflow: 'hidden',
        marginTop: 5,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
        borderColor: '#ffffff',
        backgroundColor: '#3498db',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
        color: '#ffffff',
    },
    status: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 30,
        textDecorationLine: 'underline',
        color: '#3498db',
        paddingLeft: 12,
    },
    btnRating: {
        overflow: 'hidden',
        marginTop: 5,
        marginBottom: 5,
        borderWidth: 1,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 6,
        borderColor: '#ffffff',
        backgroundColor: '#3498db',
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    btnDirection: {
        overflow: 'hidden',
        marginTop: 5,
        marginBottom: 5,
        borderWidth: 1,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 6,
        borderColor: '#ffffff',
        backgroundColor: '#3498db',
        fontSize: 14,
        fontWeight: '700',
        // textDecorationLine: 'underline',
        color: '#ffffff',
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewSeller);