import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';
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
import ChatScreen from './ios/components/ChatScreen';
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
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const url='http://192.168.61.59:3001';
  const [user, setUser] = useState(null);

  // Setup socket at app level
  React.useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) return;
        const userRes = await axios.get(`${url}/user`, { headers: { Authorization: `Bearer ${storedToken}` } });
        setUser(userRes.data);
        const socket = io(url, { transports: ['websocket'], withCredentials: true });
        socket.on('connect', () => {
          socket.emit('authenticate', userRes.data.id);
        });
        socket.on('newMessage', (msg) => {
          if (msg.senderId !== userRes.data.id && currentRoute !== 'chat') {
            setUnreadChatCount((p) => p + 1);
          }
        });
        return () => socket.disconnect();
      } catch (err) {
        console.log('Global socket init error', err.message);
      }
    })();
  }, []);
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
              paddingBottom: ['viewstudent', 'viewteacher','timetable','aboutus','chat'].includes(route.name) ? scale(80) : 0,
            },
          })}
          screenListeners={{
            state: (e) => {
              const routes = e.data.state.routes;
              const currentRoute = routes[routes.length - 1].name;
              setCurrentRoute(currentRoute);
              if (currentRoute === 'chat') {
                setUnreadChatCount(0);
              }
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
          <Stack.Screen name="chat" component={props => <ChatScreen {...props} url={url} setUnreadCount={setUnreadChatCount} />} />
        </Stack.Navigator>
        <Navbar currentRoute={currentRoute} unreadCount={unreadChatCount} />
      </NavigationContainer>
      <Toast />
     
    </>
  );
} 