import React from 'react';
import { View, ScrollView, Text, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { connect } from 'react-redux'
import { Marker } from 'react-native-maps';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Constants, Location, Permissions, Expo } from 'expo';
import MapViewDirections from 'react-native-maps-directions';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class Mapp extends React.Component {
    constructor() {
        super()
        this.state = {
            currentLocation: { lat: null, lng: null },
            userLocation: { lat: null, lng: null },
            get: false,
            sellerLocation: false,
        }
    }

    componentDidMount() {
        const { navigation } = this.props;
        const userLocation = navigation.getParam('userLocation')
        console.log('location==>' , userLocation);
        
        if (!Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this._getLocationAsync();
        }
        if (userLocation) {
            this.setState({ userLocation })
            if (userLocation.lat) {
                this.setState({ sellerLocation: true })
            }
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
        console.log('currentLocation==>', location);
        this.setState({
            currentLocation: { lat: location.coords.latitude, lng: location.coords.longitude },
            get: true,
        });
    };


    render() {
        const { currentLocation, get, errorMessage, userLocation, sellerLocation } = this.state
        // console.log('..ehere..', currentLocation, userLocation);
        const coordinates = [
            {
                latitude: currentLocation.lat,
                longitude: currentLocation.lng,
            },
            {
                latitude: userLocation.lat,
                longitude: userLocation.lng,
            },
        ]
        // const GOOGLE_MAPS_APIKEY = 'AIzaSyC54DlVp8B9o09nJi9wCI5J8tuQWDwiVT0'
        return (
            <View style={{ flex: 1 }}>
                {get && sellerLocation ?
                    // <View>
                    < MapView
                        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        style={styles.map}
                        region={{
                            latitude: currentLocation.lat,
                            longitude: userLocation.lng,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA,
                        }}
                    >

                        <MapView.Marker
                            coordinate={{
                                latitude: currentLocation.lat,
                                longitude: currentLocation.lng,
                            }}
                        />

                        <MapView.Marker
                            coordinate={{
                                latitude: userLocation.lat,
                                longitude: userLocation.lng,
                            }}
                        />

                        {/* <MapViewDirections
                            origin={coordinates[0]}
                            destination={coordinates[coordinates.length - 1]}
                            apikey={GOOGLE_MAPS_APIKEY}
                            strokeWidth={3}
                            strokeColor="hotpink"
                        />  */}

                    </MapView >
                    :
                    <View style={styles.container}>
                        <Text style={{ fontSize: 18, fontWeight: '700', }} >Location Not Available!</Text>
                    </View>
                }
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
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

export default connect(mapStateToProps, mapDispatchToProps)(Mapp);