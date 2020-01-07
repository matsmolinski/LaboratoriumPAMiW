import React, { useState } from 'react'
import { View, AsyncStorage, ActivityIndicator } from 'react-native'
import { Button, Input, Text, Icon } from 'react-native-elements'
import { Formik } from 'formik'
import styles from '../assets/styles'

const Registration = ({ navigation: { navigate } }) => {
    const [mainError, setMainError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passError, setPassError] = useState('')
    const [loading, setLoading] = useState(false)

    const _signInAsync = async values => {
        
        let ret = false
        if (values.password !== values.rpassword) {
            setPassError("Passwords do not match")
            ret = true
        }
        else {
            setPassError('')
        }
        if(checkMail(values.email)) {
            return
        }
        if(ret) {
            return
        }
        if(values.password === '') {
            setPassError("Please enter and repeat password")
            return
        }

        setLoading(true)
        const response = await fetch('http://backendpamiw.herokuapp.com/register', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'name': values.name,
                    'email': values.email,
                    'password': values.password
                })
        })
        
        if (response.status === 200) {
            setLoading(false)
            response.text().then(function (text) {
                setMainError(text)
              });
        } else {
            setLoading(false)
            response.text().then(function (text) {
                setMainError(text)
              });
        }
    }

    const checkMail = (value) =>  {
        let at = false, nextAt = false, dot = false, nextDot = false
        if (value.length === 0) {
            setEmailError("Please enter a valid email address")
            return true
        }
        for(let char of value) {
            if(at) {
                nextAt = true;
            }
            if(char === '@') {
                at = true;
            }
            if(dot) {
                nextDot = true;
            }
            if(char === '.' && nextAt) {
                dot = true;
            }

        }
        if(!nextDot) {
            setEmailError("Please enter a valid email address")
            return true
        }
        else {
            setEmailError('')
            return false
        }
    }


    return (
        <Formik
            initialValues={{
                name: '',
                email: '',
                password: '',
                rpassword: ''
            }}
            onSubmit={values => _signInAsync(values)}
        >
            {({ handleChange, handleBlur, handleSubmit, values }) => (
                <View style={styles.container}>
                    <View style={{ marginBottom: 20 }}>
                        <Text h1>Register</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            placeholder="Enter login"
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            value={values.name}
                            label="Login"
                            errorMessage={mainError}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Input 
                            placeholder="Enter email"
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}                           
                            label="Email"
                            errorMessage={emailError}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Input 
                            placeholder="Enter password"
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            secureTextEntry
                            label="Password"
                            errorMessage={passError}
                        />
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Input 
                            placeholder="Repeat password"
                            onChangeText={handleChange('rpassword')}
                            onBlur={handleBlur('rpassword')}
                            value={values.rpassword}
                            secureTextEntry
                            label="Repeat password"                           
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

Registration.navigationOptions = ({ navigation }) => ({
    tabBarIcon: () => (
        <Icon type="antdesign" name="team" size={20} />
    )
})

export default Registration
