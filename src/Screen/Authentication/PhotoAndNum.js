import React from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input, Button } from 'react-native-elements';
import { ImagePicker, Location, Permissions, } from 'expo'
import { connect } from 'react-redux'
import firebase from 'firebase'
import { info_send } from '../../Store/actions/authAction'
import { StackActions, NavigationActions } from 'react-navigation';
import { from } from 'rxjs';
import uuid from 'uuid';

async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            // console.log(e);
            reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
    });
    const ref = firebase.storage().ref().child(uuid.v4());
    const snapshot = await ref.put(blob);
    // We're done with the blob, close and release it
    blob.close();
    return await snapshot.ref.getDownloadURL();
}

class PhoneScreen extends React.Component {
    constructor() {
        super()
        this.state = {
            number: '',
            Name: '',
            image: '',
            currentUID: ''
        }
    }

    componentDidMount() {
        const { CurrentUser, UID } = this.props
        if (CurrentUser) {
            this.setState({
                Name: CurrentUser.Name,
                currentUID: UID
            })
        }
        this._getLocationAsync();
    }

    componentWillReceiveProps(props) {
        const { CurrentUser, UID } = props
        if (CurrentUser) {
            this.setState({
                Name: CurrentUser.Name,
                currentUID: UID
            })
        }
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        // console.log('where==>', location);
        this.setState({
            location,
            where: { lat: location.coords.latitude, lng: location.coords.longitude },
        });
    };

    componentDidUpdate() {
        const { location } = this.state
        if (!location) {
            setTimeout(() => {
                this.sendLocation()
            }, 13000);
        }
    }

    sendLocation() {
        const { currentUID, location } = this.state
        if (location) {
            this.setState({ where: { lat: location.coords.latitude, lng: location.coords.longitude } })
        } else {
            alert('Please Turn on Your Location!')
            this._getLocationAsync();
        }

    }

    _pickImage = async () => {
        await Permissions.askAsync(Permissions.CAMERA_ROLL);
        const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            // aspect: 1,
        });
        // this.setState({ image: uri });
        this._handleImagePicked(uri, cancelled);
    };

    _handleImagePicked = async (uri, cancelled) => {
        try {
            this.setState({ uploading: true });
            if (!cancelled) {
                uploadUrl = await uploadImageAsync(uri);
                // console.log(uploadUrl, 'url>>>>>>>>>>>>>')
                this.setState({ image: uploadUrl });
            }
        } catch (e) {
            // console.log(e);
            alert('Image Upload failed!');
        }
    }


    submit() {
        const { number, image, currentUID, where } = this.state

        if (!image) {
            alert('Please Add Image')
        } else if (!(/^(?:\+\d{2})?\d{11}(?:,(?:\+\d{2})?\d{11})*$/.test(number))) {
            alert('Fill the correct phone number')
        } else if (!where) {
            alert('Turn on Your Location!')
        } else {
            const obj = {
                Photo: image,
                number: number,
                where
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
    render() {
        const { number, image, Name } = this.state

        return (
            <ScrollView>
                <KeyboardAvoidingView behavior="position" enabled>
                    <View style={styles.container}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30, marginTop: 20 }}>Welcome {Name}! </Text>
                        <View style={{ marginBottom: 30 }}>
                            <TouchableOpacity onPress={this._pickImage}>
                                {image ?
                                    <Image style={styles.icon} source={{ uri: image }} /> :
                                    <Image style={styles.icon} source={require("../../../assets/avater.png")} />
                                }
                            </TouchableOpacity>
                            {
                                !image &&
                                <Button
                                    onPress={this._pickImage}
                                    icon={
                                        <Icon
                                            name="image"
                                            size={25}
                                        // color="white"
                                        />
                                    }
                                    title="  Add Image"
                                    type="clear"
                                    color='blue'
                                />
                            }
                        </View>

                        <Input
                            placeholder=' Mobile Number#'
                            onChangeText={(e) => this.setState({ number: e })}
                            value={number}
                            keyboardType='numeric'
                            leftIcon={
                                <Icon
                                    name='phone'
                                    size={20}
                                    color='black'
                                />
                            }
                        />
                        <View style={{ marginTop: 42 }}>
                            <Button
                                onPress={() => this.submit()}
                                icon={
                                    <Icon
                                        name="save"
                                        size={25}
                                        color="white"
                                    />
                                }
                                title="  SUBMIT"
                                color='blue'
                                linearGradientProps={{
                                    colors: ['#0f0c29', '#302b63', '#24243e'],
                                    start: { x: 0, y: 0.5 },
                                    end: { x: 1, y: 0.5 },
                                }}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        height: 200,
        width: 200,
        borderRadius: 100,
        paddingLeft: 20
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

export default connect(mapStateToProps, mapDispatchToProps)(PhoneScreen);