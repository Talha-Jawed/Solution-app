import React from 'react';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'
import firebase from 'firebase'
import { Header, Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

class Inbox extends React.Component {
    constructor() {
        super()
        this.state = {
            UID: '',
            chat: false
        }
    }
    componentDidMount() {
        const { CurrentUser, UID } = this.props
        var inbox = []
        if (CurrentUser) {
            firebase.database().ref('/Messages/').on('child_added', snapShot => {
                const Messages = snapShot.val();
                if (Messages.id == 1) {
                    if (Messages.reciver.UID === UID || Messages.sender.UID === UID) {
                        inbox.push(Messages)
                    }
                }
            })
        }

        this.setState({
            inboxUser: inbox,
            CurrentUser,
            UID,
            chat: true
        })
    }

    back() {
        this.props.navigation.navigate('Home')
    }

    viewSeller(item) {
        this.props.navigation.navigate('Chat', { item })
    }

    static navigationOptions = { header: null }

    render() {
        const { inboxUser, UID, chat } = this.state

        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="center"
                    // rightComponent={{ icon: 'add', color: 'white' }}
                    centerComponent={{ text: 'INBOX', style: { color: '#fff' } }}
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.back() }}
                />
                <ScrollView>
                    {chat &&
                        inboxUser.map((item, index) => {
                            if (item.reciverUid === UID) {
                                // console.log('iyem==>', item);
                                return (
                                    <TouchableOpacity key={index} onPress={() => this.viewSeller(item.sender)}>
                                        <View style={styles.view}>
                                            <View>
                                                <Avatar
                                                    size='large'
                                                    rounded
                                                    title="RR"
                                                    activeOpacity={0.7}
                                                    source={{
                                                        uri: item.sender.Photo

                                                    }}
                                                />
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: 16, fontWeight: "700", paddingLeft: 8 }}> {item.sender.Name}</Text>
                                                <Text style={{ paddingRight: 8, paddingTop: 12 }}><Icon name='wechat' size={30} color='#30e836' /></Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            } else if (item.senderUid === UID) {
                                return (
                                    <TouchableOpacity key={index} onPress={() => this.viewSeller(item.reciver)}>
                                        <View style={styles.view}>
                                            <View>
                                                <Avatar
                                                    size='large'
                                                    rounded
                                                    title="SR"
                                                    activeOpacity={0.7}
                                                    source={{
                                                        uri: item.reciver.Photo

                                                    }}
                                                />
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: 16, fontWeight: "700", paddingLeft: 8 }}> {item.reciver.Name}</Text>
                                                <Text style={{ paddingRight: 8, paddingTop: 12 }}><Icon name='wechat' size={30} color='#30e836' /></Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }
                        })
                    }

                </ScrollView>
            </View >
        );
    }
}
const styles = StyleSheet.create({
    view: {
        paddingLeft: 6,
        paddingTop: 15,
        paddingBottom: 15,
        // marginLeft: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: '#eff1f2',
        borderWidth: 1,
        borderColor: 'white'
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

export default connect(mapStateToProps, mapDispatchToProps)(Inbox);