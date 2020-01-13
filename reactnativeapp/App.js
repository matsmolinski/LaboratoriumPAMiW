import React from 'react'
import { StatusBar } from 'react-native'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { LoginPage, LogoutPage, CheckSession, PublicationPage, RegistrationPage } from './components'
import { ThemeProvider } from 'react-native-elements'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { createStackNavigator } from 'react-navigation-stack'

const AppBottomTab = createMaterialBottomTabNavigator({ Publications: PublicationPage, Logout: LogoutPage },
  {
    activeColor: '#ffffff',
    inactiveColor: '#000000',
    barStyle: { backgroundColor: '#00aeef' }
  }
)
const AuthStack = createMaterialBottomTabNavigator({ Login: LoginPage, Register: RegistrationPage }, {
  activeColor: '#ffffff',
  inactiveColor: '#000000',
  barStyle: { backgroundColor: '#00aeef' }
})
//const AuthStack = createBottomTabNavigator({ Login: LoginPage, Register: RegistrationPage })
//headerMode: 'none'
const RootStack = createSwitchNavigator(
  { 
    Check: CheckSession,
    Cloud: AppBottomTab,
    Auth: AuthStack
  },
  {
    initialRouteName: 'Check'
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