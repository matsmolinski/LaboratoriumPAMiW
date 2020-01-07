import React, { useEffect } from 'react'
import styles from '../assets/styles'
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    View
} from 'react-native'

export default ({ navigation: { navigate } }) => {
    const _bootstrapAsync = async () => {
        const sessionid = await AsyncStorage.getItem('sessionid')
        const response = await fetch('http://backendpamiw.herokuapp.com/check', {
                method: 'POST',
                body: sessionid
        })
        let authorized = false
        if (response.status === 200) {
            authorized = true
        }
        navigate(authorized ? 'App' : 'Auth')
    }

    useEffect(() => {
        _bootstrapAsync()
    }, [])

    return (
        <View style={styles.container}>
            <ActivityIndicator />
            <StatusBar barStyle="default" />
        </View>
    )
}

