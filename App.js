import React from 'react';
import { View, ScrollView, Text, TextInput, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { black } from 'ansi-colors';
import Navigation from './src/Navigation/StackNavigator';
import { Provider } from 'react-redux'
import store from './src/Store/store'
console.disableYellowBox = true;

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Navigation />
      </Provider>
    );
  }
}

