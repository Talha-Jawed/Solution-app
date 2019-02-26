import React from 'react';
import { View, ScrollView, Text, Image, StyleSheet } from 'react-native';
import firebase from 'firebase'
import { connect } from 'react-redux'
import { Header, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

class Offer extends React.Component {
    constructor() {
        super()
        this.state = {
            offerPerson: '',
            category: false,
            Panding: false,
            buyerUID: '',
            Delete: false,
            star: false
        }
    }

    componentDidMount() {
        const { CurrentUser, navigation, UID } = this.props;
        const offerPerson = navigation.getParam('item')
        // console.log(offerPerson, ',,...,,');
        if (offerPerson && UID) {
            this.setState({ offerPerson, UID, buyerUID: offerPerson.UID, CurrentUser })
            if (offerPerson.category) {
                this.setState({ category: true })
            }
            var buyerUID = offerPerson.UID
        }
        firebase.database().ref('/Request/' + UID).on('child_changed', (snapShot) => {
            if (snapShot.key === buyerUID) {
                // console.log(snapShot.val(), '=====///>>')
                if (snapShot.val().status === 'Accept') {
                    this.setState({ Panding: false })
                } else if (snapShot.val().status === 'Panding') {
                    this.setState({ Panding: true })
                } else if (snapShot.val().status === 'Delete') {
                    this.setState({ Delete: true })
                }
            }

        })

        firebase.database().ref('/Request/' + UID).on('child_added', (snapShot) => {
            if (snapShot.key === buyerUID) {
                // console.log(snapShot.val(), '=====///>>')
                if (snapShot.val().status === 'Accept') {
                    this.setState({ Panding: false })
                } else if (snapShot.val().status === 'Panding') {
                    this.setState({ Panding: true })
                } else if (snapShot.val().status === 'Delete') {
                    this.setState({ Delete: true })
                }
            }
        })

        firebase.database().ref('/Rating/' + UID).on('child_added', (snapShot) => {
            if (snapShot.key === buyerUID) {
                console.log(snapShot.val(), 'star==');
                this.setState({ ratings: snapShot.val().Rating, star: true })
            }
        })
    }

    back() {
        this.props.navigation.navigate('RequestList')
    }

    sendNotification = (status) => {
        const { offerPerson, CurrentUser } = this.state;
        fetch('https://exp.host/--/api/v2/push/send', {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                "Accept": 'application/json',
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                to: offerPerson.expoToken,
                title: CurrentUser.Name,
                body: `Offer ${status}`,
            })
        });
    }

    conform() {
        const { UID, buyerUID } = this.state
        var obj = {
            status: 'Accept'
        }
        this.sendNotification(status = 'Accepted')
        firebase.database().ref('/Request/' + UID + '/' + buyerUID).update(obj);
    }

    delete() {
        const { UID, buyerUID } = this.state
        var obj = {
            status: 'Delete'
        }
        this.sendNotification(status = 'Rejected')
        firebase.database().ref('/Request/' + UID + '/' + buyerUID).update(obj);
    }

    Contact(item) {
        this.props.navigation.navigate('Chat', { item })
    }

    Direction(userLocation) {
        this.props.navigation.navigate('Mapp', { userLocation })
    }

    static navigationOptions = { header: null }

    render() {
        const { offerPerson, category, Panding, Delete, star, ratings } = this.state

        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="center"
                    // rightComponent={{ icon: 'search', color: 'white' }}
                    centerComponent={{ text: 'PROFILE', style: { color: '#fff' } }}
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.back() }}
                />
                <View style={styles.container}>
                    <Image style={styles.icon} source={{ uri: offerPerson.Photo }} />
                    <Text style={styles.text}> <Icon name='user' size={25} color='black' /> {' ' + offerPerson.Name}</Text>
                    <Text style={styles.text}> <Icon name='phone' size={25} color='black' /> {' ' + offerPerson.number}</Text>
                    {
                        category &&
                        <View style={styles.container}>
                            <Text style={styles.text}>{offerPerson.category}</Text>
                            <Text style={styles.text}> <Icon name='calendar' size={25} color='black' /> {' Experience ' + offerPerson.experience + ' Year'}</Text>
                        </View>
                    }
                    <View style={styles.container}>
                        {
                            star &&
                            <Text style={styles.rate}><Icon name='star' size={18} color='#3498db' />{ratings}</Text>
                        }
                        {!Delete ?
                            Panding ?
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <Text style={styles.btnAccept} onPress={() => this.conform()} >Confirm</Text>
                                    <Text style={styles.btnDlt} onPress={() => this.delete()}>Delete</Text>
                                </View>
                                :
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <Text style={styles.btnContact} onPress={() => this.Contact(offerPerson)}><Icon name='wechat' size={18} color='white' />{' Contact'}</Text>
                                    <Text style={styles.btnDirection} onPress={() => this.Direction(userLocation = offerPerson.where)}> <Icon name='map-marker' size={18} color='white' />{' Direction'}</Text>
                                </View>
                            :
                            <Text style={styles.status}>Rejected</Text>
                        }
                    </View>
                </View>
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: '#f2f6f9',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    icon: {
        height: 200,
        width: 200,
        borderRadius: 100,
        marginTop: 12
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 24,
        textDecorationLine: 'underline',
        color: '#404347'
    },
    status: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 30,
        // textDecorationLine: 'underline',
        color: '#ef3939'
    },
    btnAccept: {
        overflow: 'hidden',
        margin: 5,
        paddingHorizontal: 30,
        paddingVertical: 12,
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
        paddingVertical: 12,
        borderRadius: 6,
        borderColor: '#fc3737',
        fontSize: 12,
        fontWeight: '700',
        // textDecorationLine: 'underline',
        color: '#fc3737',
    },
    btnContact: {
        overflow: 'hidden',
        marginTop: 5,
        marginBottom: 5,
        // marginRight:30,
        borderWidth: 1,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 6,
        borderColor: '#ffffff',
        backgroundColor: '#31ba25',
        fontSize: 14,
        fontWeight: '700',
        // textDecorationLine: 'underline',
        color: '#ffffff',
    },
    btnDirection: {
        overflow: 'hidden',
        marginTop: 5,
        marginBottom: 5,
        // marginRight:30,
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
    },
    rate: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        textDecorationLine: 'underline',
        color: '#3498db',
        // paddingLeft: 12,
    },

});


function mapStateToProps(states) {
    return ({
        UID: states.authReducers.UID,
        CurrentUser: states.authReducers.USER,
        alluser: states.authReducers.ALLUSER,

    })
}

function mapDispatchToProps(dispatch) {
    return ({
        // userAuth: (Email, Password) => {
        //     dispatch(userAction(Email, Password));
        // }
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(Offer);