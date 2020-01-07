import React, { useState } from 'react'
import { View, AsyncStorage, ActivityIndicator } from 'react-native'
import { Button, Input, Text, Icon } from 'react-native-elements'
import { Formik } from 'formik'
import styles from '../assets/styles'

const Login = ({ navigation: { navigate } }) => {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const _signInAsync = async values => {
        setLoading(true)
        const response = await fetch('http://backendpamiw.herokuapp.com/login', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
        })
        
        if (response.status === 200) {
            const data = await response.json()
            await AsyncStorage.setItem('sessionid', data.sessionid)
            await AsyncStorage.setItem('jwt', data.jwt)
            navigate('App')
        } else {
            setLoading(false)
            response.text().then(function (text) {
                setError(text)
              });
        }
    }

    return (
        <Formik
            initialValues={{
                name: '',
                password: ''
            }}
            onSubmit={values => _signInAsync(values)}
        >
            {({ handleChange, handleBlur, handleSubmit, values }) => (
                <View style={styles.container}>
                    <View style={{ marginBottom: 20 }}>
                        <Text h1>Log In</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            placeholder="Login"
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            value={values.name}
                            label="Your login"
                            errorMessage={error}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Input 
                            placeholder="Password"
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            secureTextEntry
                            label="Password"
                        />
                    </View>
                    
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Submit" 
                            loading={loading}
                            onPress={handleSubmit} 
                        />
                    </View>
                </View>
            )}
        </Formik>
    )
}


Login.navigationOptions = ({ navigation }) => ({
    tabBarIcon: () => (
        <Icon type="antdesign" name="login" size={20} />
    )
})

export default Login

