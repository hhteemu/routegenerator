import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, TextInput, Button, Keyboard } from 'react-native'
import MapView from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import * as Location from 'expo-location'

const API_KEY = ''

export default function App() {
  const [route, setRoute] = useState([])
  const [latitude, setLatitude] = useState(60.200692)
  const [longitude, setLongitude] = useState(24.934302)
  const [length, setLength] = useState(0)
  const [location, setLocation] = useState(null)
  const [region, setRegion] = useState({
    latitude: 60.2565267751626,
    longitude:  24.895491830682207,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  })
  const [distance, setDistance] = useState()

  // Requestin permission to user location and using it as the starting region
  useEffect(() => {
    (async () => {
      let {status} = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('No permission to get location!')
        return
      }
      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0111,
        longitudeDelta: 0.0111
      })
      // Putting latitude and longitude of users location in to own states for the next part
      setLatitude(region.latitude)
      setLongitude(region.longitude)
    })()
   }, [])

  // Autogenerating route using Haversine -formula
  const generateRoute = (latitude, longitude, length) => {
    const earthRadius = 6378.1 // Radius of the earth in km
    // Converting latitude and longitude in to radians
    const lat1 = (Math.PI / 180) * latitude
    const lon1 = (Math.PI / 180) * longitude
    length = length / 6 // Dividing length by 6, because somehow that works
    const d = length / earthRadius // Distance in radians
    const directions = ['N', 'S', 'E', 'W'] // Four cardinal directions
    const direction = directions[Math.floor(Math.random() * directions.length)] // One of those directions by random
    /*
      By using the Haversine formula we calculate the latitude and longitude 
      of a point that is located at a distance of length kilometers in a random direction from the starting point. 
      The resulting latitude and longitude values are then used to create a new point in the route array.
    */
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(direction === 'N' ? 0 : Math.PI)
    )
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(direction === 'E' ? Math.PI / 2 : -Math.PI / 2) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
      )
    const direction2 = directions[Math.floor(Math.random() * directions.length)]
    const lat3 = Math.asin(
      Math.sin(lat2) * Math.cos(d) + Math.cos(lat2) * Math.sin(d) * Math.cos(direction2 === 'S' ? 0 : Math.PI)
    )
    const lon3 =
      lon2 +
      Math.atan2(
        Math.sin(direction2 === 'W' ? Math.PI / 2 : -Math.PI / 2) * Math.sin(d) * Math.cos(lat2),
        Math.cos(d) - Math.sin(lat2) * Math.sin(lat3)
      )
    const direction3 = directions[Math.floor(Math.random() * directions.length)]
    const lat4 = Math.asin(
      Math.sin(lat3) * Math.cos(d) + Math.cos(lat3) * Math.sin(d) * Math.cos(direction3 === 'N' ? 0 : Math.PI)
    )
    // Array for waypoints
    const route = [
      { latitude: latitude, longitude: longitude },
      { latitude: (180 / Math.PI) * lat2, longitude: (180 / Math.PI) * lon2 },
      { latitude: (180 / Math.PI) * lat3, longitude: (180 / Math.PI) * lon3 },
      { latitude: latitude, longitude: longitude }]
    
    setRoute(route)
    console.log(route[0])
    console.log(route[1])
    console.log(route[2])
    Keyboard.dismiss()
  }

  // Setting the starting point, which is the users location
  const startPoint = route[0]

  return (
    <View style={styles.container}>
      <MapView
        provider='google'
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}>
      <MapViewDirections 
        origin={startPoint}
        destination={startPoint}
        waypoints={route}
        strokeColor='red'
        strokeWidth={3}
        mode='WALKING'
        apikey={API_KEY}
        onReady={result =>{
          console.log(result.distance)
          setDistance(result.distance)
        }}
      /></MapView>
      <View style={styles.inputView}>
      <TextInput
          style={styles.input}
          placeholder="Length in km"
          onChangeText={text => setLength(parseFloat(text))}
          keyboardType='number-pad'
        />
        <Button title="Generate Route" onPress={() => generateRoute(latitude, longitude, length)} />
      <Text style={styles.text}>Route length: {distance} km</Text> 
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 20,
    color: 'red'
  },
  inputView: {
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute', 
    top: 0,
    left: 5,
    right: 5
  },
  input: {
    height: 40,
    padding: 10,
    marginTop: 60,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#48BBEC',
    backgroundColor: 'white',
  },
  })