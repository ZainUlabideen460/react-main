import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import WellcomePage from './ios/components/WellcomePage';
import Loginpage from './ios/components/Loginpage';
import Siginup from './ios/components/Siginup';
import Studentview from './ios/components/Studentview';
import Teacherview from './ios/components/Teacherview';
import Navbar from './ios/components/Navbar';
import Timetable from './ios/components/Timetable';
import Aboutus from './ios/components/Aboutus';
import Contactus from './ios/components/Contactus';
import Chartbord from './ios/components/Chartbord';
import Toast from 'react-native-toast-message';

// Get initial window dimensions
const { width } = Dimensions.get('window');

// Function to scale sizes based on screen width
const scale = (size, baseWidth = 375) => {
  return (size * width) / baseWidth;
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('welcomepage');
  const url='http://192.168.18.107:3001';
  //  console.log(url)
  return (
    <>
      <StatusBar
        backgroundColor="#2c5364"
        barStyle="light-content"
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="welcomepage"
          screenOptions={({ route }) => ({
            headerShown: false,
            contentStyle: {
              // Apply paddingBottom only for routes that show the Navbar
              paddingBottom: ['viewstudent', 'viewteacher','timetable','aboutus','chatbot'].includes(route.name) ? scale(80) : 0,
            },
          })}
          screenListeners={{
            state: (e) => {
              const routes = e.data.state.routes;
              const currentRoute = routes[routes.length - 1].name;
              setCurrentRoute(currentRoute);
            },
          }}
        >
          <Stack.Screen name="welcomepage" component={WellcomePage} url={url}/>
          <Stack.Screen name="login" component={props => <Loginpage {...props} url={url}/> }   />
          <Stack.Screen name="signup" component={props =><Siginup {...props} url={url}/>}  />
          <Stack.Screen name="viewstudent" component={props => <Studentview {...props} url={url}/>} />
          <Stack.Screen name="viewteacher" component={props => <Teacherview {...props} url={url}/>} />
          <Stack.Screen name="timetable" component={props => <Timetable {...props} url={url}/>}  />
          <Stack.Screen name="contactus" component={props => <Contactus {...props} url={url}/>}  />
          <Stack.Screen name="aboutus" component={Aboutus}   />
          <Stack.Screen name="chatbot" component={Chartbord} />
        </Stack.Navigator>
        <Navbar currentRoute={currentRoute} />
      </NavigationContainer>
      <Toast />
     
    </>
  );
} 