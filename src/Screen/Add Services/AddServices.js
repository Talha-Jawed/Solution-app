import React from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import firebase from 'firebase'
import { StackActions, NavigationActions } from 'react-navigation';
import { connect } from 'react-redux'
import { Header, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dropdown } from 'react-native-material-dropdown';
import { info_send } from '../../Store/actions/authAction'

class AddService extends React.Component {
    constructor() {
        super()
        this.state = {
            currentUID: '',
            category: '',
            experience: ''
        }
    }

    componentDidMount() {
        const { UID } = this.props;
        var categoryArray = []
        this.setState({ currentUID: UID })
        firebase.database().ref('/Categories/').on('child_added', snapShot => {
            var categ = snapShot.val()
            if (categ) {
                var obj = {
                    value:categ.service
                }
                categoryArray.push(obj)
            }
            this.setState({ services: categoryArray })
        })
    }

    back() {
        this.props.navigation.navigate('Home')
    }

    submit() {
        const { category, experience, currentUID } = this.state
        if (!category) {
            alert('Please Select a Service')
        } else if (experience.length > 2 || experience.length < 1) {
            alert('Please Add Correct Experience')
        } else {
            const obj = {
                category: category,
                experience: experience,
            }
            firebase.database().ref('/UserData/' + currentUID).update(obj);
            this.props._info(currentUID)
            const resetAction = StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Home' }),
                ]
            })
            this.props.navigation.dispatch(resetAction)
        }
    }


    static navigationOptions = { header: null }

    render() {
        const { experience, services } = this.state

        // let services = [{
        //     value: 'Electrician',
        // }, {
        //     value: 'Carpenter',
        // }, {
        //     value: 'Plumber',
        // }, {
        //     value: 'A.C Repairman',
        // }, {
        //     value: 'Painter',
        // }, {
        //     value: 'Fumigation',
        // }
        // ];

        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="center"
                    // rightComponent={{ icon: 'search', color: 'white' }}
                    centerComponent={{ text: 'POST SERVICES', style: { color: '#fff' } }}
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => this.back() }}
                />
                <ScrollView >
                    <View>

                        <View style={styles.container}>
                            <Dropdown
                                label='Select a Service'
                                data={services}
                                onChangeText={e => this.setState({ category: e })}

                            />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row', marginTop: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#3498db", paddingTop: 10 }}>
                                {'Experience '}
                            </Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={(e) => this.setState({ experience: e })}
                                value={experience}
                                placeholder={'1'}
                                // placeholderTextColor='rgba(255,255,255,0.7)'
                                // autoFocus
                                keyboardType='numeric'
                            />
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#3498db", paddingTop: 10 }}>
                                {' Year'}
                            </Text>
                        </View>
                        <View style={{ marginTop: 42, justifyContent: 'center', alignItems: 'center', }}>
                            <Button
                                onPress={() => this.submit()}
                                icon={
                                    <Icon
                                        name="check"
                                        size={25}
                                        color="white"
                                    />
                                }
                                title="  SUBMIT"
                                color='blue'

                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 0,
        backgroundColor: '#fff',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    input: {
        backgroundColor: 'rgba(99, 172, 221,0.5)',
        color: '#fff',
        width: 30,
        paddingLeft: 5,
        fontSize: 18,
        borderRadius: 10,
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
        _info: (currentUID) => {
            dispatch(info_send(currentUID))
        },
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(AddService);