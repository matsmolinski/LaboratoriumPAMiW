import React, { useState, useEffect } from 'react'
import { View, AsyncStorage, Alert } from 'react-native'
import styles from '../assets/styles'
import * as DocumentPicker from 'expo-document-picker'
import { Button, Input, Text, Icon } from 'react-native-elements'
import { Formik } from 'formik'
import * as FileSystem from 'expo-file-system';
import socketIO from 'socket.io-client';
import * as MediaLibrary from 'expo-media-library';

const PublicationPage = ({ navigation: { navigate } }) => {
    const [publications, setPublications] = useState([])
    const [publicationsNames, setPublicationsNames] = useState([])
    const [publicationData, setPublicationData] = useState({})
    const [view, setView] = useState('publications')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(false)

    
    useEffect(() => {
        (async () => {
            const socket = socketIO('http://backendpamiw.herokuapp.com/', {      
            transports: ['websocket'], jsonp: false });   
            socket.connect(); 
            socket.on('connect', () => { 
                console.log('connected to socket server'); 
            }); 
            socket.on("publication added", () => {  
                setAlert(true)          
            })
            try {
                if(view === 'publications') {
                    const token = await AsyncStorage.getItem('jwt')
                    const response = await fetch(`http://backendpamiw.herokuapp.com/publications`, {
                        method: 'GET',
                        headers: {
                            'Authorization': token
                        }
                    })
                    const data = await response.json()
                    setPublications(data['links'])
                    setPublicationsNames(data['names'])
                    
                }
                
            } catch(err) {
                console.log(err);
            }
        })()
    }, [])

    const uploadFile = async () => {
	    const result = await DocumentPicker.getDocumentAsync({})

        if (result.type === 'cancel') return

        const formData = new FormData()
        formData.append('file', {
            uri: result.uri,
            type: '*/*',
            name: result.name
        })
        const token = await AsyncStorage.getItem('jwt')
        try {
            let response = await fetch(`http://backendpamiw.herokuapp.com/publications/` + view, {
                method: 'POST',
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': token
                },
                body: formData
            })
            .then(setView(view))
            response = await fetch(`http://backendpamiw.herokuapp.com/publications/` + view, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        })
        const data = await response.json()
        setPublicationData(data)


        } catch(err) {
            console.log(err)
        }
    }

    const addPublication = async values => {
        if(values.title === '' || values.publisher === '' || values.author === '') {
            setError('Please fill all fields')
            return
        }
        setLoading(true)
        const token = await AsyncStorage.getItem('jwt')
        const response = await fetch('http://backendpamiw.herokuapp.com/publications', {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: JSON.stringify({'title': values.title, 'publisher': values.publisher, 'author': values.author, 'accessibility': 'private', 'names': []})
        })
        if (response.status === 200) {
            setLoading(false)
            const token = await AsyncStorage.getItem('jwt')
            const response = await fetch(`http://backendpamiw.herokuapp.com/publications`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })
            const data = await response.json()
            setPublications(data['links'])
            setPublicationsNames(data['names'])
            setView('publications')
        } else {
            setLoading(false)
            response.text().then(function (text) {
                setError(text)
              });
        }
    }
    
    const removePublication = async (pub) => {
        console.log(pub)
        const token = await AsyncStorage.getItem('jwt')
        let response = await fetch(`http://backendpamiw.herokuapp.com/publications/` + pub, {
            method: 'DELETE',
            headers: {
                'Authorization': token
            }
        })
        if (response.ok) {
            response = await fetch(`http://backendpamiw.herokuapp.com/publications`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })
            const data = await response.json()
            setPublications(data['links'])
            setPublicationsNames(data['names'])
            setView('publications')
        }
    }

    const getFile = async (file) => {  
        const token = await AsyncStorage.getItem('jwt')   
        FileSystem.downloadAsync("http://backendpamiw.herokuapp.com/publications/" + view + "/" + file, FileSystem.documentDirectory + file, {'Authorization' : token})
        .then(({ uri }) => {
            console.log('Finished downloading to ', uri);
            //MediaLibrary.saveToLibraryAsync(uri)
        })
    }

    const removeFile = async (file) => {
        const token = await AsyncStorage.getItem('jwt')
        let response = await fetch(`http://backendpamiw.herokuapp.com/publications/` + view + '/' + file, {
            method: 'DELETE',
            headers: {
                'Authorization': token
            }
        })
        if (response.ok) {
            response = await fetch(`http://backendpamiw.herokuapp.com/publications/` + view, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })
            const data = await response.json()
            setPublicationData(data)
        }
        

    }

    const openPublication = async (pub) => {
        const token = await AsyncStorage.getItem('jwt')
        const response = await fetch(`http://backendpamiw.herokuapp.com/publications/` + pub, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        })
        const data = await response.json()
        setPublicationData(data)
        setView(pub)
    }

    const refreshPublications = async () => {
        const token = await AsyncStorage.getItem('jwt')
            const response = await fetch(`http://backendpamiw.herokuapp.com/publications`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })
            const data = await response.json()
            setPublications(data['links'])
            setPublicationsNames(data['names'])
            setView('publications')
        }

    if(view === 'publications') {
        if(alert) {
            Alert.alert(
                'Server info',
                'New publication added'
            )
            setAlert(false)
        }
        return (
            <View style={styles.container}>
                <View style={styles.absoluteButtonContainer}>
                    <Icon
                        reverse
                        type="antdesign"
                        name="plus"
                        color="#00aeef"
                        onPress={() => {setView('addpub')}}
                    />
                </View>
                <Text h3>Publications:</Text>
                {publications.map((pub, index) => (
                    <View style={styles.buttonSeriesContainer}>
                    <Button
                        style={styles.buttonSeries}
                        key={index}
                        title={publicationsNames[index]}
                        onPress={() => {openPublication(pub)}} 
                    />
                    <Icon 
                        key={index + 100000} 
                        type="antdesign" 
                        name="delete" 
                        size={50} 
                        onPress={() => {removePublication(pub)}}
                    />
                    </View>
                ))}
            </View>
        )
    }
    else if(view === 'addpub') {
        return (               
                <Formik
                    initialValues={{
                        title: '',
                        author: '',
                        publisher: ''
                    }}
                    onSubmit={values => addPublication(values)}
                >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <View style={styles.container}>
                            <View style={{ marginBottom: 20 }}>
                                <Text h3>Add publication:</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder="Title"
                                    onChangeText={handleChange('title')}
                                    onBlur={handleBlur('title')}
                                    value={values.name}
                                    label="Title"
                                    errorMessage={error}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Input 
                                    placeholder="Author"
                                    onChangeText={handleChange('author')}
                                    onBlur={handleBlur('author')}
                                    value={values.password}
                                    label="Author"
                                />
                            </View>
                            
                            <View style={styles.inputContainer}>
                                <Input 
                                    placeholder="Publisher"
                                    onChangeText={handleChange('publisher')}
                                    onBlur={handleBlur('publisher')}
                                    value={values.password}
                                    label="Publisher"
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Submit" 
                                    loading={loading}
                                    onPress={handleSubmit} 
                                    buttonStyle={styles.button}
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Cancel" 
                                    onPress={() => {refreshPublications()}}
                                    buttonStyle={styles.button}
                                />
                            </View>
                        </View>
                    )}
                </Formik>       
        )
    }
    return (
        <View style={styles.container}>
            <View style={styles.absoluteButtonContainer}>
                <Icon
                    reverse
                    type="antdesign"
                    name="plus"
                    color="#00aeef"
                    onPress={uploadFile}
                />
            </View>
            <Text h3>Publication:</Text>
            <Text>Title: {publicationData['title']}</Text>
            <Text>Author: {publicationData['author']}</Text>
            <Text>Publisher: {publicationData['publisher']}</Text>
            {publicationData['links'].map((file, index) => (
                <View style={styles.buttonSeriesContainer}>
                <Button
                    style={styles.buttonSeries}
                    key={index}
                    title={file}
                    onPress={() => {getFile(file)}} 
                />
                <Icon 
                    key={index + 100000} 
                    type="antdesign" 
                    name="delete" 
                    size={50} 
                    onPress={() => {removeFile(file)}}
                />
                </View>
            ))}
            <View style={styles.buttonContainer}>
                <Button
                    title="Cancel" 
                    onPress={() => {refreshPublications()}} 
                    buttonStyle={styles.button}
                />
            </View>
        </View>
    )
   
}

PublicationPage.navigationOptions = () => ({
    tabBarIcon: () => (
        <Icon type="antdesign" name="folder1" size={20} />
    )
})

export default PublicationPage
