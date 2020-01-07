import React, { useState } from 'react'
import { View, AsyncStorage } from 'react-native'
import { Icon, Button, Text } from 'react-native-elements'
import styles from '../assets/styles'

const Profile = ({ navigation: { navigate } }) => {
    const [loading, setLoading] = useState(false)

    const _signOutAsync = async () => {
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
    }
    
    return (
        <View style={styles.container}>
                <Text h3>Profile Screen</Text>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Sign Out"
                        loading={loading}
                        onPress={_signOutAsync} 
                    />
                </View>
        </View>
    )
}

Profile.navigationOptions = {
    tabBarIcon: () => (
        <Icon type="antdesign" name="logout" size={20} />
    )
}

export default Profile
