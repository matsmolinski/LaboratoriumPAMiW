import React, { useState, useEffect } from 'react'
import { View, AsyncStorage, ActivityIndicator } from 'react-native'
import { Icon, Button, Text } from 'react-native-elements'
import styles from '../assets/styles'

const Logout = ({ navigation: { navigate } }) => {
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const token = await AsyncStorage.getItem('jwt')
                const session = await AsyncStorage.getItem('sessionid')
                await fetch('https://backendpamiw.herokuapp.com/logout', { 
                    method: 'DELETE',
                    headers: {'Authorization': token},
                    body:  JSON.stringify({'sessionid': session})}
                    )
                await AsyncStorage.clear()
                navigate('Auth')                                               
            } catch(err) {
                console.log(err);
            }
        })()
    }, [])
    return (
        <View style={styles.container}>
                <View style={styles.container}>
                    <ActivityIndicator animating={loading} />
                </View>
        </View>
    )
}

Logout.navigationOptions = {
    tabBarIcon: () => (
        <Icon type="antdesign" name="logout" size={20} />
    )
}

export default Logout
