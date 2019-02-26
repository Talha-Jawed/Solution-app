import { createStackNavigator, createAppContainer, createDrawerNavigator, createMaterialTopTabNavigator } from 'react-navigation';
import LogIn from '../Screen/Authentication/Auth'
import Home from '../Screen/Dashboard'
import PhoneScreen from '../Screen/Authentication/PhotoAndNum'
import AddService from '../Screen/Add Services/AddServices'
import ViewSeller from '../Screen/View Seller/viewSeller'
import MyProfile from '../Screen/My Profile/MyProfile'
import Mapp from '../Component/Map'
import Chat from '../Screen/Chat/Chat'
import Offer from '../Screen/Notification/Offer'
import RequestList from '../Screen/Notification/RequestList';
import Inbox from '../Screen/Inbox/inbox'

const StackNavigator = createStackNavigator({
    LogIn: {
        screen: LogIn
    },
    Home: {
        screen: Home
    },
    PhoneScreen: {
        screen: PhoneScreen
    },
    AddService: {
        screen: AddService
    },
    ViewSeller: {
        screen: ViewSeller
    },
    MyProfile: {
        screen: MyProfile
    },
    Mapp: {
        screen: Mapp
    },
    Chat: {
        screen: Chat
    },
    Offer: {
        screen: Offer
    },
    RequestList: {
        screen: RequestList
    },
    Inbox:{
        screen: Inbox
    }
})
const Navigation = createAppContainer(StackNavigator)
export default Navigation;