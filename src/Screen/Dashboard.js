import React from 'react';
import { View, ScrollView, Alert, Text, TextInput, StyleSheet, Platform, Button, RefreshControl, ActivityIndicator, Dimensions, Image } from 'react-native';
import firebase from 'firebase'
import { StackActions, NavigationActions } from 'react-navigation';
import { connect } from 'react-redux'
import { Header } from 'react-native-elements';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Constants, Location, Notifications, Permissions, Expo, Contacts } from 'expo';
import { Refresh, _logOut } from '../Store/actions/authAction'
import geolib from 'geolib'


async function getToken() {
  // Remote notifications do not work in simulators, only on device
  let { status } = await Permissions.askAsync(
    Permissions.NOTIFICATIONS,
  );
  if (status !== 'granted') {
    return;
  }
  var value = await Notifications.getExpoPushTokenAsync();
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const uid = user.uid;
      firebase.database().ref('UserData/' + uid).update({ expoToken: value })
    }
  })
}

class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      alluser: null,
      CurrentUser: '',
      currentUID: '',
      loading: false,
      Name: '',
      search: '',
      _search: false,
      image: '',
      where: { lat: null, lng: null },
      seller: [],
      _Sellers: false,
      contactMatch: '',
      refreshing: false,
    }
  }

  componentWillReceiveProps(props) {
    const { alluser, CurrentUser, UID } = props
    var AllSellers = []
    if (alluser && CurrentUser) {
      setTimeout(() => {
        this.setState({
          alluser,
          loading: true,
          image: CurrentUser.Photo,
          currentUID: UID,
          currentUser: CurrentUser
        })
        alluser.map((item) => {
          if (item.category && !(item.admin === 'Block') && !(item.UID === CurrentUser.UID)) {
            this.getDistance(item.where, CurrentUser.where).then((res) => {
              // console.log(res, 'resposWill===>>');
              if (res <= 10000) {
                AllSellers.push({ item })
              }
              this.setState({ seller: AllSellers, _Sellers: true })
            })
          }
        })
      }, 100);

    }
  }

  componentDidMount() {
    const { alluser, CurrentUser, UID, SendRequest, ReceiveRequest, contactMatch } = this.props;

    var AllSellers = []
    if (alluser && CurrentUser) {
      setTimeout(() => {
        this.setState({
          alluser,
          loading: true,
          image: CurrentUser.Photo,
          currentUID: UID,
          currentUser: CurrentUser
        })
        alluser.map((item) => {
          if (item.category && !(item.admin === 'Block') && !(item.UID === CurrentUser.UID)) {
            this.getDistance(item.where, CurrentUser.where).then((res) => {
              // console.log(res, 'respos===>>');
              if (res <= 10000) {
                AllSellers.push({ item })
              }
              this.setState({ seller: AllSellers, _Sellers: true })
            })
          }
        })
      }, 100);

    }

    this.getContacts();
    getToken();
    this.listener = Notifications.addListener(this.handleNotification);
  }

  _onRefresh = () => {
    const { currentUser } = this.state
    this.setState({ refreshing: true });
    this.props.userRefresh(currentUser)
    this.setState({ refreshing: false });
  }

  handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${(data)}`,
    );
  };

  async getDistance(myLocation, userLocation) {
    const direction = await geolib.getDistanceSimple(
      myLocation,
      userLocation
    )
    return direction
  }

  async getContacts() {
    const { currentUID } = this.state
    const permission = await Permissions.askAsync(Permissions.CONTACTS)
    if (permission.status !== 'granted') {
      // Permission was denied...
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.PHONE_NUMBERS,
        Contacts.EMAILS,
      ]
    })
    if (data.length > 0) {
      var phoneContact = [];
      setTimeout(() => {
        const objj = {
          phoneContacts: phoneContact
        }
        this.contactList()
      }, 100)
      data.map((i) => {
        const name = i.name;
        i.phoneNumbers.map((n) => {
          const obj = {
            name: name,
            number: n.number
          }
          phoneContact.push({ obj })
          this.setState({ contactMatch: phoneContact })
        })
      })
    }
  }

  contactList() {
    const { contactMatch, alluser } = this.state
    var contactSeller = []
    if (contactMatch && alluser) {
      alluser.map(item => {
        if (item.category && !(item.admin === 'Block')) {
          var allNum = item.number
          contactMatch.map(i => {
            if (i.obj.number === allNum) {
              contactSeller.push(item)
            }
          })
        }
      })
    }
    if (contactSeller.length > 0) {
      // console.log(contactSeller, 'Contact==>>')
      this.setState({ contact: true, contactUsers: contactSeller })
    }
  }

  searchItem() {
    const { search, alluser, currentUser } = this.state

    var userSearch = []
    if (search && alluser) {
      alluser.map(item => {
        if (item.category && !(item.admin === 'Block') && !(item.UID === currentUser.UID)) {
          if (item.Name === search || item.category === search || item.number === search) {
            userSearch.push(item)
          }
        }
      })
    }

    if (userSearch.length > 0) {
      this.setState({ _search: false, userSearch, search: '', Search: true })
    } else {
      alert('Search Not Found..')
      this.setState({ Search: false })
    }
  }

  LogOut() {
    this.props.userLogOut()
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'LogIn' }),
      ]
    })
    this.props.navigation.dispatch(resetAction)
  }

  setMenuRef = ref => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
    this.setState({ _search: false })
  };

  startSearch() {
    this.setState({ _search: true })
  }

  AddService() {
    this._menu.hide();
    this.props.navigation.navigate('AddService')
  }

  Profile() {
    this._menu.hide();
    this.props.navigation.navigate('MyProfile')
  }

  Notification() {
    this._menu.hide();
    this.props.navigation.navigate('RequestList')
  }

  Inbox() {
    this._menu.hide();
    this.props.navigation.navigate('Inbox')
  }

  viewSeller(item) {
    this.setState({ _search: false })
    this.props.navigation.navigate('ViewSeller', { item })
  }

  static navigationOptions = { header: null }

  render() {
    const { Search, contactUsers, loading, _Sellers, _search, userSearch, seller, contact } = this.state

    return (
      <View style={{ flex: 1 }}>
        <Header
          placement="left"
          rightComponent={{ icon: 'search', color: 'white', onPress: () => this.startSearch() }}
          centerComponent={{ text: 'Home', style: { color: '#fff' } }}
          leftComponent={{ icon: 'menu', color: '#fff', onPress: () => this.showMenu() }}
        />
        <Menu
          ref={this.setMenuRef}
          button={<Text></Text>}
        >
          <MenuItem onPress={() => this.AddService()}>Add Services</MenuItem>
          <MenuItem onPress={() => this.Profile()}>Profile</MenuItem>
          <MenuItem onPress={() => this.Notification()}>Notifications</MenuItem>
          <MenuItem onPress={() => this.Inbox()}>Inbox</MenuItem>
          <MenuDivider />
          <MenuItem onPress={() => this.LogOut()}><Text style={{ color: 'red' }}>Log Out</Text></MenuItem>
        </Menu>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
        >

          <View style={styles.container}>
            {!loading ?
              <ActivityIndicator size="large" color="#0000ff" />
              :
              <View >
                {
                  _search
                  &&
                  this.searchComponent()
                }
                {
                  userSearch &&
                  <View>
                    <Text style={styles.heading}>Search Found!</Text>
                    <ScrollView horizontal>
                      {userSearch && Search ?
                        userSearch.map((item, index) => {
                          return (
                            <View key={index} style={{ flexDirection: 'row' }} >
                              <View style={{ height: 255, width: 170, borderWidth: 2, flex: 1, borderColor: '#e1e9f4', margin: 15, backgroundColor: '#cce6ff', borderRadius: 10, }}>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={styles.cardTitle}>{item.category}</Text>
                                </View>
                                <View>
                                  <Image style={styles.img} source={{ uri: item.Photo }} />
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={styles.titleName}>{item.Name}</Text>
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  <Text onPress={() => this.viewSeller(item)} style={{ fontSize: 16, color: '#3498db', paddingBottom: 8, paddingTop: 3 }}>VIEW NOW</Text>
                                </View>
                              </View>
                            </View>
                          )
                        })
                        :
                        <Text style={{ fontSize: 18, padding: 10, color: '#3498db' }}>Search Result Not Found</Text>
                      }
                    </ScrollView>
                  </View>
                  // :
                  // <Text style={{ fontSize: 18, padding: 10, color: '#3498db' }}>Result Not Found</Text>

                }
                <View>
                  <Text style={styles.heading}>Categoris Near By You!</Text>
                </View>
                <ScrollView horizontal={true}>
                  {_Sellers ?
                    seller.map((item, index) => {
                      // console.log(item);
                      return (
                        <View key={index} style={{ flexDirection: 'row' }} >
                          <View style={{ height: 255, width: 170, borderWidth: 2, flex: 1, borderColor: '#e1e9f4', margin: 15, backgroundColor: '#cce6ff', borderRadius: 10, }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={styles.cardTitle}>{item.item.category}</Text>
                            </View>
                            <View>
                              <Image style={styles.img} source={{ uri: item.item.Photo }} />
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={styles.titleName}>{item.item.Name}</Text>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                              <Text onPress={() => this.viewSeller(item)} style={{ fontSize: 16, color: '#3498db', paddingBottom: 8, paddingTop: 3 }}>VIEW NOW</Text>
                            </View>
                          </View>
                        </View>
                      )
                    })
                    :
                    <Text style={{ fontSize: 18, padding: 10, color: '#3498db' }}>Result Not Found</Text>
                  }
                </ScrollView>
                {
                  contact &&

                  <View>
                    <Text style={styles.heading}>Contact User's!</Text>
                    <ScrollView horizontal>
                      {contact ?
                        contactUsers.map((item, index) => {
                          // console.log(item);
                          return (
                            <View key={index} style={{ flexDirection: 'row' }} >
                              <View style={{ height: 255, width: 170, borderWidth: 2, flex: 1, borderColor: '#e1e9f4', margin: 15, backgroundColor: '#cce6ff', borderRadius: 10, }}>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={styles.cardTitle}>{item.category}</Text>
                                </View>
                                <View>
                                  <Image style={styles.img} source={{ uri: item.Photo }} />
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={styles.titleName}>{item.Name}</Text>
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  <Text onPress={() => this.viewSeller(item)} style={{ fontSize: 16, color: '#3498db', paddingBottom: 8, paddingTop: 3 }}>VIEW NOW</Text>
                                </View>
                              </View>
                            </View>
                          )
                        })
                        :
                        <Text style={{ fontSize: 18, padding: 10, color: '#3498db' }}>Result Not Found</Text>
                      }
                    </ScrollView>
                  </View>
                }
              </View>
            }
          </View>
        </ScrollView>
      </View>
    );
  }
  searchComponent() {
    const { search } = this.state
    return (
      <View style={{ flex: 1, justifyContent: 'space-around', flexDirection: 'row' }}>
        <TextInput
          style={styles.input}
          onChangeText={(e) => this.setState({ search: e })}
          value={search}
          placeholder={'Search ...'}
          placeholderTextColor='rgba(255,255,255,0.7)'
          autoFocus
        />
        <Text onPress={() => this.searchItem()} style={{ fontSize: 18, fontWeight: 'bold', color: "#3498db", paddingTop: 10 }}>
          <Icon name='search' size={20} color='#3498db' /> {'Search'}
        </Text>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 0,
    backgroundColor: '#ffffff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  input: {
    backgroundColor: 'rgba(99, 172, 221,0.5)',
    marginBottom: 10,
    color: '#fff',
    height: 40,
    width: 225,
    paddingHorizontal: 10,
    fontSize: 18,
    borderRadius: 20
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 8,
    paddingBottom: 2,
    paddingTop: 2,
    textDecorationLine: 'underline'
  },
  img: {
    height: 160,
    width: 165,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424c59'
  },
  titleName: {
    paddingTop: 6,
    paddingBottom: 3,
    fontSize: 14,
    fontWeight: '600',

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
    userRefresh: (currentUser) => {
      dispatch(Refresh(currentUser))
    },
    userLogOut: () => {
      dispatch(_logOut())
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);