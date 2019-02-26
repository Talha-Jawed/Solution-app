import React from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import firebase from 'firebase'
import { StackActions, NavigationActions } from 'react-navigation';
import { connect } from 'react-redux'
import { Header, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';


class MyProfile extends React.Component {
    constructor() {
        super()
        this.state = {
            CurrentUser: '',
            category: false
        }
    }

    componentDidMount() {
        const { CurrentUser } = this.props;
        if (CurrentUser) {
            this.setState({ CurrentUser: CurrentUser })
            if (CurrentUser.category) {
                this.setState({ category: true })
            }
        }
    }

    back() {
        this.props.navigation.navigate('Home')
    }

    static navigationOptions = { header: null }

    render() {
        const { CurrentUser, category } = this.state

        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="center"
                    // rightComponent={{ icon: 'search', color: 'white' }}
                    centerComponent={{ text: 'PROFILE', style: { color: '#fff' } }}
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.back() }}
                />
                <View style={styles.container}>
                    <Image style={styles.icon} source={{ uri: CurrentUser.Photo }} />
                    <Text style={styles.text}> <Icon name='user' size={25} color='black' /> {' ' + CurrentUser.Name}</Text>
                    <Text style={styles.text}> <Icon name='phone' size={25} color='black' /> {' ' + CurrentUser.number}</Text>
                    {
                        category &&
                        <View style={styles.container}>
                            <Text style={styles.text}>{' ' + CurrentUser.category}</Text>
                            <Text style={styles.text}> <Icon name='calendar' size={25} color='black' /> {' Experience ' + CurrentUser.experience + ' Year '}</Text>
                        </View>
                    }
                </View>
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginTop: 30,
        textDecorationLine: 'underline',
        color: '#404347'
    }

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

export default connect(mapStateToProps, mapDispatchToProps)(MyProfile);