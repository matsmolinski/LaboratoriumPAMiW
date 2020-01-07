import React, { useState, useEffect } from 'react'
import { View, AsyncStorage } from 'react-native'
import styles from '../assets/styles'
import * as DocumentPicker from 'expo-document-picker'
import { Button, Input, Text, Icon } from 'react-native-elements'
import { Formik } from 'formik'
import {RNFetchBlob} from 'rn-fetch-blob'

const FilesScreen = ({ navigation: { navigate } }) => {
    const [publications, setPublications] = useState([])
    const [publicationData, setPublicationData] = useState({})
    const [view, setView] = useState('publications')
    const [files, setFiles] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        (async () => {
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
                    console.log(data)
                    console.log(data['links'])
                    setPublications(data['links'])
                    
                }
                
            } catch(err) {
                console.log(err);
            }
        })()
    }, [])

    const _pickDocument = async () => {
	    const result = await DocumentPicker.getDocumentAsync({})

        if (result.type === 'cancel') return

        const formData = new FormData()
        formData.append('file', {
            uri: result.uri,
            type: '*/*',
            name: result.name
        })

        //if (files.filter(file => file.name === data.name).length === 0) setFiles(prev => prev.concat(data))
        const token = await AsyncStorage.getItem('jwt')
        try {
            const response = await fetch(`http://backendpamiw.herokuapp.com/publications/` + view, {
                method: 'POST',
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': token
                },
                body: formData
            })
            .then(setView(view))
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
                body: JSON.stringify(values)
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
            console.log(data)
            console.log(data['links'])
            setPublications(data['links'])
            setView('publications')
        } else {
            setLoading(false)
            response.text().then(function (text) {
                setError(text)
              });
        }
    }
    
    const removePublication = (pub) => {
        console.log("in preparation")
    }

    const getFile = async (file) => {
        console.log("in preparation")
        const { config, fs } = RNFetchBlob
        let PictureDir = fs.dirs.PictureDir // this is the pictures directory. You can check the available directories in the wiki.
        let options = {
            fileCache: true,
            addAndroidDownloads : {
                useDownloadManager : true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
                notification : false,
                path:  PictureDir + "/me_"+Math.floor(date.getTime() + date.getSeconds() / 2), // this is the path where your downloaded file will live in
                description : 'Downloading image.'
            }
        }
        config(options).fetch('GET', "http://backendpamiw.herokuapp.com/publications/" + view + "/" + file).then((res) => {
        // do some magic here
})
    }

    const removeFile = async (file) => {
        console.log("in preparation")
    }

    const openPublication = async (pub) => {
        console.log("rypkens")
        const token = await AsyncStorage.getItem('jwt')
        const response = await fetch(`http://backendpamiw.herokuapp.com/publications/` + pub, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        })
        const data = await response.json()
        console.log(data)
        console.log(data['links'])
        setPublicationData(data)
        setView(pub)
    }

    if(view === 'publications') {
        return (
            <View style={styles.container}>
                <View style={styles.absoluteButtonContainer}>
                    <Icon
                        reverse
                        type="antdesign"
                        name="plus"
                        color="blue"
                        onPress={() => {setView('addpub')}}
                    />
                </View>
                <Text h3>Publications:</Text>
                {publications.map((pub, index) => (
                    <View>
                    <Button
                        key={index}
                        title={pub}
                        onPress={() => {openPublication(pub)}} 
                    />
                    <Icon 
                        key={index + 100000} 
                        type="antdesign" 
                        name="folder1" 
                        size={50} 
                        onPress={(file) => {removeFile(file)}}
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
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Cancel" 
                                    onPress={() => {setView('publications')}} 
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
                    color="blue"
                    onPress={_pickDocument}
                />
            </View>
            <Text h3>Publication:</Text>
            <Text>Title: {publicationData['title']}</Text>
            <Text>Author: {publicationData['author']}</Text>
            <Text>Publisher: {publicationData['publisher']}</Text>
            {publicationData['links'].map((file, index) => (
                <View>
                <Button
                    key={index}
                    title={file}
                    onPress={() => {getFile(file)}} 
                />
                <Icon 
                    key={index + 100000} 
                    type="antdesign" 
                    name="folder1" 
                    size={50} 
                    onPress={(file) => {removeFile(file)}}
                />
                </View>
            ))}
            <View style={styles.buttonContainer}>
                <Button
                    title="Cancel" 
                    onPress={() => {setView('publications')}} 
                />
            </View>
        </View>
    )
   
}

FilesScreen.navigationOptions = () => ({
    tabBarIcon: () => (
        <Icon type="antdesign" name="folder1" size={20} />
    )
})

export default FilesScreen
