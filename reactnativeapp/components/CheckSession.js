import React, { useEffect } from 'react'
import styles from '../assets/styles'
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    View
} from 'react-native'

export default ({ navigation: { navigate } }) => {
    const checkSession = async () => {
        const sessionid = await AsyncStorage.getItem('sessionid')
        const response = await fetch('http://backendpamiw.herokuapp.com/check', {
                method: 'POST',
                body: JSON.stringify({'sessionid': sessionid})
        })
        let authorized = false
        if (response.status === 200) {
            authorized = true
        }
        navigate(authorized ? 'Cloud' : 'Auth')
    }

    useEffect(() => {
        checkSession()
    }, [])

    return (
        <View style={styles.container}>
            <ActivityIndicator />
            <StatusBar barStyle="default" />
        </View>
    )
}

