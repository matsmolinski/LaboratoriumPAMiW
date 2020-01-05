import React from 'react'
import { StatusBar } from 'react-native'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { HomeScreen, LoginScreen, ProfileScreen, AuthLoadingScreen, FilesScreen } from './components'
import { ThemeProvider } from 'react-native-elements'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { createStackNavigator } from 'react-navigation-stack'

const AppBottomTab = createBottomTabNavigator({ Home: HomeScreen, Files: FilesScreen, Profile: ProfileScreen })
const AuthStack = createStackNavigator({ Login: LoginScreen }, { headerMode: 'none' })

const RootStack = createSwitchNavigator(
  { 
    AuthLoading: AuthLoadingScreen,
    App: AppBottomTab,
    Auth: AuthStack
  },
  {
    initialRouteName: 'AuthLoading'
  }
)

const AppContainer = createAppContainer(RootStack)

export default () => (
  <ThemeProvider theme={theme}>
    <StatusBar hidden />
    <AppContainer />
  </ThemeProvider>
)

const theme = {
  Button: {
    raised: true
  }
}


/*import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
*/