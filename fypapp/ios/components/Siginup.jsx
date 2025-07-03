// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Platform,
//   KeyboardAvoidingView,
//   StatusBar,
//   ImageBackground,
//   Dimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRoute } from '@react-navigation/native';
// import { Picker } from '@react-native-picker/picker';
// import Toast from 'react-native-toast-message';

// import axios from 'axios';

// // Get initial window dimensions
// const { width, height } = Dimensions.get('window');

// // Function to scale sizes based on screen width
// const scale = (size) => {
//   return (size * width) / 375;
// };
// // Function to scale font sizes
// const scaleFont = (size) => {
//   return Math.round((size * Math.min(width, height)) / 375);
// };

// // Custom toast configurations
// const toastConfig = {
//   success: ({ text1, text2, ...rest }) => (
//     <View style={[styles.toastContainer, styles.successToast]}>
//       <Text style={styles.toastTitle}>{text1}</Text>
//       <Text style={styles.toastMessage}>{text2}</Text>
//     </View>
//   ),
//   error: ({ text1, text2, ...rest }) => (
//     <View style={[styles.toastContainer, styles.errorToast]}>
//       <Text style={styles.toastTitle}>{text1}</Text>
//       <Text style={styles.toastMessage}>{text2}</Text>
//     </View>
//   ),
//   info: ({ text1, text2, ...rest }) => (
//     <View style={[styles.toastContainer, styles.infoToast]}>
//       <Text style={styles.toastTitle}>{text1}</Text>
//       <Text style={styles.toastMessage}>{text2}</Text>
//     </View>
//   ),
// };

// // Reusable toast function
// const showToast = (message, type = 'error') => {
//   Toast.show({
//     type: type,
//     text1: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
//     text2: message,
//     position: 'top',
//     visibilityTime: 3000,
//     autoHide: true,
//     topOffset: Platform.OS === 'ios' ? 50 : 30,
//   });
// };

// export default function Signup({ navigation ,url}) {
//   const [form, setForm] = useState({
//     studentname: '',
//     cnic: '',
//     aridno: '',
//     degree: '',
//     shift: '',
//     semester: '',
//     section: '',
//     courses: '',
//     classes_info: '',
//     email: '',
//     teacherId: '',
//     teachername: '',
//   });
//   const [sections, setSections] = useState([]);
//   const [isLoadingSections, setIsLoadingSections] = useState(false);
//   const [sectionError, setSectionError] = useState('');
//   const [focusedInput, setFocusedInput] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const route = useRoute();
//   const role = route.params?.role || 'student';

//   useEffect(() => {
//     if (role === 'student') {
//       fetchSections();
//     }
//   }, [role]);

//   // const url = 'http://192.168.18.107:3001';

//   const fetchSections = async () => {
//     setIsLoadingSections(true);
//     setSectionError('');
//     try {
//       const response = await axios.get(`${url}/sections`);
//       console.log('Sections response:', response.data);
//       if (response.data && Array.isArray(response.data)) {
//         setSections(response.data);
//       } else {
//         setSectionError('No sections available.');
//         showToast('No sections available from the server.', 'error');
//       }
//     } catch (error) {
//       console.error('Error fetching sections:', error);
//       setSectionError('Failed to load sections. Please try again.');
//       showToast('Failed to load sections. Please try again.', 'error');
//     } finally {
//       setIsLoadingSections(false);
//     }
//   };

//   // Validation functions
//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validateCNIC = (cnic) => {
//     // Basic CNIC validation - 13 digits
//     const cnicRegex = /^\d{13}$/;
//     return cnicRegex.test(cnic);
//   };

//   const validateAridNo = (aridno) => {
//     // Basic validation for Arid number format
//     const aridRegex = /^\d{2}-arid-\d{3}$/i;
//     return aridRegex.test(aridno);
//   };

//   const validateForm = () => {
//     if (role === 'student') {
//       const {
//         studentname,
//         cnic,
//         aridno,
//         email,
//         section,
//         semester,
//         shift,
//       } = form;

//       if (!studentname || !aridno || !cnic || !section || !semester || !shift || !email) {
//         showToast('Please fill in all required fields', 'error');
//         return false;
//       }

//       if (!validateEmail(email)) {
//         showToast('Please enter a valid email address', 'error');
//         return false;
//       }

//       if (!validateCNIC(cnic)) {
//         showToast('CNIC must be 13 digits without dashes', 'error');
//         return false;
//       }

//       if (!validateAridNo(aridno)) {
//         showToast('Invalid Arid number format (e.g., 21-arid-483)', 'error');
//         return false;
//       }

//     } else {
//       const { teachername, cnic, teacherId, email } = form;

//       if (!teachername || !cnic || !teacherId || !email) {
//         showToast('Please fill in all required fields', 'error');
//         return false;
//       }

//       if (!validateEmail(email)) {
//         showToast('Please enter a valid email address', 'error');
//         return false;
//       }

//       if (!validateCNIC(cnic)) {
//         showToast('CNIC must be 13 digits without dashes', 'error');
//         return false;
//       }
//     }

//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);
//     const apiUrl = `${url}/register`;

//     try {
//       if (role === 'student') {
//         const {
//           studentname,
//           cnic,
//           aridno,
//           degree,
//           shift,
//           semester,
//           section,
//           courses,
//           classes_info,
//           email,
//         } = form;

//         const payload = {
//           name: studentname,
//           cnic,
//           aridno,
//           degree,
//           shift,
//           semester,
//           section,
//           courses,
//           classes_info,
//           email,
//           role: 'student',
//         };

//         const response = await fetch(apiUrl, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payload),
//         });

//         const data = await response.json();

//         if (response.ok) {
//           showToast('Registration successful!', 'success');
//           setTimeout(() => {
//             navigation.navigate('login', { role });
//           }, 1500);
//         } else {
//           showToast(data.error || 'Registration failed. Please try again.', 'error');
//         }
//       } else {
//         const { teachername, cnic, teacherId, email } = form;

//         const payload = {
//           name: teachername,
//           cnic,
//           teachersNo: parseInt(teacherId),
//           email,
//           role: 'teacher',
//         };

//         const response = await fetch(apiUrl, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payload),
//         });

//         const data = await response.json();

//         if (response.ok) {
//           showToast('Registration successful!', 'success');
//           setTimeout(() => {
//             navigation.navigate('login', { role });
//           }, 1500);
//         } else {
//           showToast(data.error || 'Registration failed. Please try again.', 'error');
//         }
//       }
//     } catch (err) {
//       console.error('Registration error:', err);
//       showToast('Network error. Please check your connection and try again.', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
//       <ImageBackground
//         source={{ uri: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
//         style={styles.backgroundImage}
//         blurRadius={3}
//       >
//         <LinearGradient
//           colors={['rgba(25, 47, 89, 0.7)', 'rgba(10, 19, 36, 0.92)']}
//           style={styles.overlay}
//         >
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.container}
//             keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
//           >
//             <ScrollView contentContainerStyle={styles.scrollContainer}>
//               <View style={styles.card}>
//                 <LinearGradient
//                   colors={['#4C78DB', '#3D5FBE']}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                 />
//                 <Text style={styles.heading}>
//                   Sign Up as <Text style={styles.roleheading}>{role === 'student' ? 'Student' : 'Teacher'}</Text> 
//                 </Text>
//                 <Text style={styles.subheading}>
//                   Fill in your details to join{' '}
//                   <Text style={styles.roletext}>Smart Course Planner</Text>
//                 </Text>

//                 {role === 'student' ? (
//                   <>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Full Name</Text>
//                       <TextInput
//                         placeholder="Enter your full name"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'studentname' && styles.inputFocused]}
//                         value={form.studentname}
//                         onChangeText={(text) => setForm({ ...form, studentname: text })}
//                         onFocus={() => setFocusedInput('studentname')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>CNIC Number</Text>
//                       <TextInput
//                         placeholder="Enter your CNIC (13 digits)"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'cnic' && styles.inputFocused]}
//                         keyboardType="numeric"
//                         value={form.cnic}
//                         onChangeText={(text) => setForm({ ...form, cnic: text })}
//                         onFocus={() => setFocusedInput('cnic')}
//                         onBlur={() => setFocusedInput(null)}
//                         maxLength={13}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Arid No</Text>
//                       <TextInput
//                         placeholder="e.g. 21-arid-483"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'aridno' && styles.inputFocused]}
//                         value={form.aridno}
//                         onChangeText={(text) => setForm({ ...form, aridno: text })}
//                         onFocus={() => setFocusedInput('aridno')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Email Address</Text>
//                       <TextInput
//                         placeholder="Enter your email"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
//                         keyboardType="email-address"
//                         value={form.email}
//                         onChangeText={(text) => setForm({ ...form, email: text })}
//                         onFocus={() => setFocusedInput('email')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Semester</Text>
//                       <TextInput
//                         placeholder="Enter your semester"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'semester' && styles.inputFocused]}
//                         value={form.semester}
//                         onChangeText={(text) => setForm({ ...form, semester: text })}
//                         onFocus={() => setFocusedInput('semester')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Section</Text>
//                       {isLoadingSections ? (
//                         <Text style={styles.loadingText}>Loading sections...</Text>
//                       ) : sectionError ? (
//                         <Text style={styles.errorText}>{sectionError}</Text>
//                       ) : (
//                         <View
//                           style={[
//                             styles.pickerContainer,
//                             focusedInput === 'section' && styles.inputFocused,
//                           ]}
//                         >
//                           <Picker
//                             selectedValue={form.section}
//                             onValueChange={(itemValue) => setForm({ ...form, section: itemValue })}
//                             style={styles.picker}
//                             dropdownIconColor="#2c3e50"
//                             onFocus={() => setFocusedInput('section')}
//                             onBlur={() => setFocusedInput(null)}
//                           >
//                             <Picker.Item label="Select Section" value="" />
//                             {sections.map((section) => (
//                               <Picker.Item
//                                 key={section.id}
//                                 label={section.sectionDisplay}
//                                 value={section.sectionDisplay}
//                               />
//                             ))}
//                           </Picker>
//                         </View>
//                       )}
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Shift</Text>
//                       <TextInput
//                         placeholder="Enter your shift"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'shift' && styles.inputFocused]}
//                         value={form.shift}
//                         onChangeText={(text) => setForm({ ...form, shift: text })}
//                         onFocus={() => setFocusedInput('shift')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                   </>
//                 ) : (
//                   <>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Full Name</Text>
//                       <TextInput
//                         placeholder="Enter your full name"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'teachername' && styles.inputFocused]}
//                         value={form.teachername}
//                         onChangeText={(text) => setForm({ ...form, teachername: text })}
//                         onFocus={() => setFocusedInput('teachername')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>CNIC Number</Text>
//                       <TextInput
//                         placeholder="Enter your CNIC (13 digits)"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'cnic' && styles.inputFocused]}
//                         keyboardType="numeric"
//                         value={form.cnic}
//                         onChangeText={(text) => setForm({ ...form, cnic: text })}
//                         onFocus={() => setFocusedInput('cnic')}
//                         onBlur={() => setFocusedInput(null)}
//                         maxLength={13}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Teacher ID</Text>
//                       <TextInput
//                         placeholder="Enter your teacher ID"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'teacherId' && styles.inputFocused]}
//                         value={form.teacherId}
//                         onChangeText={(text) => setForm({ ...form, teacherId: text })}
//                         onFocus={() => setFocusedInput('teacherId')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Email Address</Text>
//                       <TextInput
//                         placeholder="Enter your email"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
//                         keyboardType="email-address"
//                         value={form.email}
//                         onChangeText={(text) => setForm({ ...form, email: text })}
//                         onFocus={() => setFocusedInput('email')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                   </>
//                 )}

//                 <TouchableOpacity
//                   style={[styles.signupBtn, isSubmitting && styles.disabledButton]}
//                   onPress={handleSubmit}
//                   activeOpacity={0.7}
//                   disabled={isSubmitting}
//                 >
//                   <LinearGradient
//                     colors={isSubmitting ? ['#94A3B8', '#64748B'] : ['#3B82F6', '#1D4ED8']}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 0 }}
//                     style={styles.signupBtnGradient}
//                   >
//                     <Text style={styles.signupBtnText}>
//                       {isSubmitting ? 'Submitting...' : 'Sign Up'}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={() => navigation.navigate('login', { role })}>
//                   <Text style={styles.loginText}>
//                     Already have an account? <Text style={styles.loginTextBold}>Login</Text>
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.footer}>
//                 <Text style={styles.footerText}>© 2025 Smart Course Planner</Text>
//               </View>
//             </ScrollView>
//           </KeyboardAvoidingView>
//         </LinearGradient>
//         <Toast config={toastConfig} />
//       </ImageBackground>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   backgroundImage: {
//     width: '100%',
//     height: '100%',
//   },
//   overlay: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: scale(20),
//     paddingVertical: scale(10),
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: scale(40),
//     marginTop: Platform.OS === 'ios' ? scale(40) : scale(20),
//   },
//   roleheading: {
//     color: '#F59E0B',
//   },
//   card: {
//     padding: scale(10),
//     width: '100%',
//     maxWidth: Math.min(width * 0.9, 420),
//     backgroundColor: 'transparent',
//     borderRadius: scale(24),
//     alignItems: 'center',
//     marginTop: scale(10),
//   },
//   heading: {
//     fontSize: scaleFont(26),
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: scale(12),
//   },
//   subheading: {
//     fontSize: scaleFont(14),
//     color: '#E5E7EB',
//     marginBottom: scale(20),
//     textAlign: 'center',
//     paddingHorizontal: scale(10),
//   },
//   roletext: {
//     color: '#F59E0B',
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: scale(15),
//   },
//   inputLabel: {
//     fontSize: scaleFont(14),
//     fontWeight: '600',
//     color: '#E5E7EB',
//     marginBottom: scale(8),
//     marginLeft: scale(4),
//   },
//   input: {
//     width: '100%',
//     height: scale(50),
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: scale(25),
//     paddingHorizontal: scale(15),
//     fontSize: scaleFont(16),
//     color: '#111827',
//     borderWidth: scale(1.5),
//     borderColor: '#E5E7EB',
//   },
//   inputFocused: {
//     borderColor: '#3B82F6',
//     backgroundColor: '#F0F7FF',
//     shadowColor: '#3B82F6',
//     shadowOffset: { width: 0, height: scale(3) },
//     shadowOpacity: 0.2,
//     shadowRadius: scale(6),
//     elevation: 4,
//   },
//   pickerContainer: {
//     width: '100%',
//     height: scale(50),
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: scale(25),
//     borderWidth: scale(1.5),
//     borderColor: '#E5E7EB',
//     justifyContent: 'center',
//     overflow: 'hidden',
//   },
//   picker: {
//     width: '100%',
//     height: scale(50),
//     color: '#111827',
//     fontSize: scaleFont(16),
//   },
//   signupBtn: {
//     width: '100%',
//     height: scale(50),
//     borderRadius: scale(25),
//     marginTop: scale(10),
//     marginBottom: scale(15),
//     overflow: 'hidden',
//   },
//   disabledButton: {
//     opacity: 0.7,
//   },
//   signupBtnGradient: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   signupBtnText: {
//     color: '#FFFFFF',
//     fontSize: scaleFont(16),
//     fontWeight: 'bold',
//     letterSpacing: 0.5,
//   },
//   loginText: {
//     color: '#E5E7EB',
//     fontSize: scaleFont(14),
//     marginBottom: scale(10),
//   },
//   loginTextBold: {
//     color: '#3B82F6',
//     fontWeight: 'bold',
//   },
//   loadingText: {
//     color: '#FFFFFF',
//     fontSize: scaleFont(14),
//     textAlign: 'center',
//   },
//   errorText: {
//     color: '#FF6B6B',
//     fontSize: scaleFont(14),
//     textAlign: 'center',
//   },
//   footer: {
//     marginTop: scale(4),
//   },
//   footerText: {
//     color: 'rgba(255, 255, 255, 0.6)',
//     fontSize: scaleFont(10),
//   },
  
//   // Toast styles
//   toastContainer: {
//     width: '90%',
//     borderRadius: scale(12),
//     padding: scale(12),
//     marginHorizontal: '5%',
//     flexDirection: 'column',
//     alignItems: 'flex-start',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.27,
//     shadowRadius: 4.65,
//     elevation: 6,
//   },
//   successToast: {
//     backgroundColor: 'rgba(52, 211, 153, 0.95)',
//   },
//   errorToast: {
//     backgroundColor: 'rgba(248, 113, 113, 0.95)',
//   },
//   infoToast: {
//     backgroundColor: 'rgba(96, 165, 250, 0.95)',
//   },
//   toastTitle: {
//     fontSize: scaleFont(16),
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: scale(4),
//   },
//   toastMessage: {
//     fontSize: scaleFont(14),
//     color: '#FFFFFF',
//   },
// });







// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Platform,
//   KeyboardAvoidingView,
//   StatusBar,
//   ImageBackground,
//   Dimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRoute } from '@react-navigation/native';
// import { Picker } from '@react-native-picker/picker';
// import Toast from 'react-native-toast-message';

// import axios from 'axios';

// // Get initial window dimensions
// const { width, height } = Dimensions.get('window');

// // Function to scale sizes based on screen width
// const scale = (size) => {
//   return (size * width) / 375;
// };
// // Function to scale font sizes
// const scaleFont = (size) => {
//   return Math.round((size * Math.min(width, height)) / 375);
// };

// // Custom toast configurations
// const toastConfig = {
//   success: ({ text1, text2, ...rest }) => (
//     <View style={[styles.toastContainer, styles.successToast]}>
//       <Text style={styles.toastTitle}>{text1}</Text>
//       <Text style={styles.toastMessage}>{text2}</Text>
//     </View>
//   ),
//   error: ({ text1, text2, ...rest }) => (
//     <View style={[styles.toastContainer, styles.errorToast]}>
//       <Text style={styles.toastTitle}>{text1}</Text>
//       <Text style={styles.toastMessage}>{text2}</Text>
//     </View>
//   ),
//   info: ({ text1, text2, ...rest }) => (
//     <View style={[styles.toastContainer, styles.infoToast]}>
//       <Text style={styles.toastTitle}>{text1}</Text>
//       <Text style={styles.toastMessage}>{text2}</Text>
//     </View>
//   ),
// };

// // Reusable toast function
// const showToast = (message, type = 'error') => {
//   Toast.show({
//     type: type,
//     text1: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
//     text2: message,
//     position: 'top',
//     visibilityTime: 3000,
//     autoHide: true,
//     topOffset: Platform.OS === 'ios' ? 50 : 30,
//   });
// };

// export default function Signup({ navigation, url }) {
//   const [form, setForm] = useState({
//     studentname: '',
//     cnic: '',
//     aridno: '',
//     degree: '',
//     shift: '',
//     semester: '',
//     section: '',
//     courses: '',
//     classes_info: '',
//     email: '',
//     teacherId: '',
//     teachername: '',
//   });
//   const [sections, setSections] = useState([]);
//   const [isLoadingSections, setIsLoadingSections] = useState(false);
//   const [sectionError, setSectionError] = useState('');
//   const [focusedInput, setFocusedInput] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isVerifyingTeacher, setIsVerifyingTeacher] = useState(false);

//   const route = useRoute();
//   const role = route.params?.role || 'student';

//   useEffect(() => {
//     if (role === 'student') {
//       fetchSections();
//     }
//   }, [role]);

//   const fetchSections = async () => {
//     setIsLoadingSections(true);
//     setSectionError('');
//     try {
//       const response = await axios.get(`${url}/sections`);
//       console.log('Sections response:', response.data);
//       if (response.data && Array.isArray(response.data)) {
//         setSections(response.data);
//       } else {
//         setSectionError('No sections available.');
//         showToast('No sections available from the server.', 'error');
//       }
//     } catch (error) {
//       console.error('Error fetching sections:', error);
//       setSectionError('Failed to load sections. Please try again.');
//       showToast('Failed to load sections. Please try again.', 'error');
//     } finally {
//       setIsLoadingSections(false);
//     }
//   };

//   // New function to verify teacher ID
//   const verifyTeacherId = async (teacherId) => {
//     try {
//       const response = await axios.get(`${url}/teachers`);
//       if (response.data && Array.isArray(response.data)) {
//         const teacherExists = response.data.some(teacher => 
//           teacher.teacherid === parseInt(teacherId) || teacher.teacherid === teacherId
//         );
//         return teacherExists;
//       }
//       return false;
//     } catch (error) {
//       console.error('Error verifying teacher ID:', error);
//       throw new Error('Failed to verify teacher ID. Please try again.');
//     }
//   };

//   // Validation functions
//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validateCNIC = (cnic) => {
//     // Basic CNIC validation - 13 digits
//     const cnicRegex = /^\d{13}$/;
//     return cnicRegex.test(cnic);
//   };

//   const validateAridNo = (aridno) => {
//     // Basic validation for Arid number format
//     const aridRegex = /^\d{2}-arid-\d{3}$/i;
//     return aridRegex.test(aridno);
//   };

//   const validateForm = () => {
//     if (role === 'student') {
//       const {
//         studentname,
//         cnic,
//         aridno,
//         email,
//         section,
//         semester,
//         shift,
//       } = form;

//       if (!studentname || !aridno || !cnic || !section || !semester || !shift || !email) {
//         showToast('Please fill in all required fields', 'error');
//         return false;
//       }

//       if (!validateEmail(email)) {
//         showToast('Please enter a valid email address', 'error');
//         return false;
//       }

//       if (!validateCNIC(cnic)) {
//         showToast('CNIC must be 13 digits without dashes', 'error');
//         return false;
//       }

//       if (!validateAridNo(aridno)) {
//         showToast('Invalid Arid number format (e.g., 21-arid-483)', 'error');
//         return false;
//       }

//     } else {
//       const { teachername, cnic, teacherId, email } = form;

//       if (!teachername || !cnic || !teacherId || !email) {
//         showToast('Please fill in all required fields', 'error');
//         return false;
//       }

//       if (!validateEmail(email)) {
//         showToast('Please enter a valid email address', 'error');
//         return false;
//       }

//       if (!validateCNIC(cnic)) {
//         showToast('CNIC must be 13 digits without dashes', 'error');
//         return false;
//       }
//     }

//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       if (role === 'student') {
//         const {
//           studentname,
//           cnic,
//           aridno,
//           degree,
//           shift,
//           semester,
//           section,
//           courses,
//           classes_info,
//           email,
//         } = form;

//         const payload = {
//           name: studentname,
//           cnic,
//           aridno,
//           degree,
//           shift,
//           semester,
//           section,
//           courses,
//           classes_info,
//           email,
//           role: 'student',
//         };

//         const response = await fetch(`${url}/register`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payload),
//         });

//         const data = await response.json();

//         if (response.ok) {
//           showToast('Registration successful!', 'success');
//           setTimeout(() => {
//             navigation.navigate('login', { role });
//           }, 1500);
//         } else {
//           showToast(data.error || 'Registration failed. Please try again.', 'error');
//         }
//       } else {
//         // Teacher registration - verify teacher ID first
//         const { teachername, cnic, teacherId, email } = form;

//         setIsVerifyingTeacher(true);
//         showToast('Verifying teacher ID...', 'info');

//         try {
//           const teacherExists = await verifyTeacherId(teacherId);
          
//           if (!teacherExists) {
//             showToast('Teacher ID not found in the system. Please contact admin.', 'error');
//             return;
//           }

//           // If teacher ID exists, proceed with registration
//           const payload = {
//             name: teachername,
//             cnic,
//             teachersNo: parseInt(teacherId),
//             email,
//             role: 'teacher',
//           };

//           const response = await fetch(`${url}/register`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload),
//           });

//           const data = await response.json();

//           if (response.ok) {
//             showToast('Registration successful!', 'success');
//             setTimeout(() => {
//               navigation.navigate('login', { role });
//             }, 1500);
//           } else {
//             showToast(data.error || 'Registration failed. Please try again.', 'error');
//           }
//         } catch (verificationError) {
//           showToast(verificationError.message || 'Failed to verify teacher ID', 'error');
//         } finally {
//           setIsVerifyingTeacher(false);
//         }
//       }
//     } catch (err) {
//       console.error('Registration error:', err);
//       showToast('Network error. Please check your connection and try again.', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
//       <ImageBackground
//         source={{ uri: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
//         style={styles.backgroundImage}
//         blurRadius={3}
//       >
//         <LinearGradient
//           colors={['rgba(25, 47, 89, 0.7)', 'rgba(10, 19, 36, 0.92)']}
//           style={styles.overlay}
//         >
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.container}
//             keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
//           >
//             <ScrollView contentContainerStyle={styles.scrollContainer}>
//               <View style={styles.card}>
//                 <LinearGradient
//                   colors={['#4C78DB', '#3D5FBE']}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                 />
//                 <Text style={styles.heading}>
//                   Sign Up as <Text style={styles.roleheading}>{role === 'student' ? 'Student' : 'Teacher'}</Text> 
//                 </Text>
//                 <Text style={styles.subheading}>
//                   Fill in your details to join{' '}
//                   <Text style={styles.roletext}>Smart Course Planner</Text>
//                 </Text>

//                 {role === 'student' ? (
//                   <>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Full Name</Text>
//                       <TextInput
//                         placeholder="Enter your full name"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'studentname' && styles.inputFocused]}
//                         value={form.studentname}
//                         onChangeText={(text) => setForm({ ...form, studentname: text })}
//                         onFocus={() => setFocusedInput('studentname')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>CNIC Number</Text>
//                       <TextInput
//                         placeholder="Enter your CNIC (13 digits)"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'cnic' && styles.inputFocused]}
//                         keyboardType="numeric"
//                         value={form.cnic}
//                         onChangeText={(text) => setForm({ ...form, cnic: text })}
//                         onFocus={() => setFocusedInput('cnic')}
//                         onBlur={() => setFocusedInput(null)}
//                         maxLength={13}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Arid No</Text>
//                       <TextInput
//                         placeholder="e.g. 21-arid-483"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'aridno' && styles.inputFocused]}
//                         value={form.aridno}
//                         onChangeText={(text) => setForm({ ...form, aridno: text })}
//                         onFocus={() => setFocusedInput('aridno')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Email Address</Text>
//                       <TextInput
//                         placeholder="Enter your email"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
//                         keyboardType="email-address"
//                         value={form.email}
//                         onChangeText={(text) => setForm({ ...form, email: text })}
//                         onFocus={() => setFocusedInput('email')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Semester</Text>
//                       <TextInput
//                         placeholder="Enter your semester"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'semester' && styles.inputFocused]}
//                         value={form.semester}
//                         onChangeText={(text) => setForm({ ...form, semester: text })}
//                         onFocus={() => setFocusedInput('semester')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Section</Text>
//                       {isLoadingSections ? (
//                         <Text style={styles.loadingText}>Loading sections...</Text>
//                       ) : sectionError ? (
//                         <Text style={styles.errorText}>{sectionError}</Text>
//                       ) : (
//                         <View
//                           style={[
//                             styles.pickerContainer,
//                             focusedInput === 'section' && styles.inputFocused,
//                           ]}
//                         >
//                           <Picker
//                             selectedValue={form.section}
//                             onValueChange={(itemValue) => setForm({ ...form, section: itemValue })}
//                             style={styles.picker}
//                             dropdownIconColor="#2c3e50"
//                             onFocus={() => setFocusedInput('section')}
//                             onBlur={() => setFocusedInput(null)}
//                           >
//                             <Picker.Item label="Select Section" value="" />
//                             {sections.map((section) => (
//                               <Picker.Item
//                                 key={section.id}
//                                 label={section.sectionDisplay}
//                                 value={section.sectionDisplay}
//                               />
//                             ))}
//                           </Picker>
//                         </View>
//                       )}
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Shift</Text>
//                       <TextInput
//                         placeholder="Enter your shift"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'shift' && styles.inputFocused]}
//                         value={form.shift}
//                         onChangeText={(text) => setForm({ ...form, shift: text })}
//                         onFocus={() => setFocusedInput('shift')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                   </>
//                 ) : (
//                   <>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Full Name</Text>
//                       <TextInput
//                         placeholder="Enter your full name"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'teachername' && styles.inputFocused]}
//                         value={form.teachername}
//                         onChangeText={(text) => setForm({ ...form, teachername: text })}
//                         onFocus={() => setFocusedInput('teachername')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>CNIC Number</Text>
//                       <TextInput
//                         placeholder="Enter your CNIC (13 digits)"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'cnic' && styles.inputFocused]}
//                         keyboardType="numeric"
//                         value={form.cnic}
//                         onChangeText={(text) => setForm({ ...form, cnic: text })}
//                         onFocus={() => setFocusedInput('cnic')}
//                         onBlur={() => setFocusedInput(null)}
//                         maxLength={13}
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Teacher ID</Text>
//                       <TextInput
//                         placeholder="Enter your teacher ID"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'teacherId' && styles.inputFocused]}
//                         value={form.teacherId}
//                         onChangeText={(text) => setForm({ ...form, teacherId: text })}
//                         onFocus={() => setFocusedInput('teacherId')}
//                         onBlur={() => setFocusedInput(null)}
//                         keyboardType="numeric"
//                       />
//                     </View>
//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Email Address</Text>
//                       <TextInput
//                         placeholder="Enter your email"
//                         placeholderTextColor="#9CA3AF"
//                         style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
//                         keyboardType="email-address"
//                         value={form.email}
//                         onChangeText={(text) => setForm({ ...form, email: text })}
//                         onFocus={() => setFocusedInput('email')}
//                         onBlur={() => setFocusedInput(null)}
//                       />
//                     </View>
//                   </>
//                 )}

//                 <TouchableOpacity
//                   style={[styles.signupBtn, (isSubmitting || isVerifyingTeacher) && styles.disabledButton]}
//                   onPress={handleSubmit}
//                   activeOpacity={0.7}
//                   disabled={isSubmitting || isVerifyingTeacher}
//                 >
//                   <LinearGradient
//                     colors={(isSubmitting || isVerifyingTeacher) ? ['#94A3B8', '#64748B'] : ['#3B82F6', '#1D4ED8']}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 0 }}
//                     style={styles.signupBtnGradient}
//                   >
//                     <Text style={styles.signupBtnText}>
//                       {isVerifyingTeacher ? 'Verifying...' : isSubmitting ? 'Submitting...' : 'Sign Up'}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={() => navigation.navigate('login', { role })}>
//                   <Text style={styles.loginText}>
//                     Already have an account? <Text style={styles.loginTextBold}>Login</Text>
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.footer}>
//                 <Text style={styles.footerText}>© 2025 Smart Course Planner</Text>
//               </View>
//             </ScrollView>
//           </KeyboardAvoidingView>
//         </LinearGradient>
//         <Toast config={toastConfig} />
//       </ImageBackground>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   backgroundImage: {
//     width: '100%',
//     height: '100%',
//   },
//   overlay: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: scale(20),
//     paddingVertical: scale(10),
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: scale(40),
//     marginTop: Platform.OS === 'ios' ? scale(40) : scale(20),
//   },
//   roleheading: {
//     color: '#F59E0B',
//   },
//   card: {
//     padding: scale(10),
//     width: '100%',
//     maxWidth: Math.min(width * 0.9, 420),
//     backgroundColor: 'transparent',
//     borderRadius: scale(24),
//     alignItems: 'center',
//     marginTop: scale(10),
//   },
//   heading: {
//     fontSize: scaleFont(26),
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: scale(12),
//   },
//   subheading: {
//     fontSize: scaleFont(14),
//     color: '#E5E7EB',
//     marginBottom: scale(20),
//     textAlign: 'center',
//     paddingHorizontal: scale(10),
//   },
//   roletext: {
//     color: '#F59E0B',
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: scale(15),
//   },
//   inputLabel: {
//     fontSize: scaleFont(14),
//     fontWeight: '600',
//     color: '#E5E7EB',
//     marginBottom: scale(8),
//     marginLeft: scale(4),
//   },
//   input: {
//     width: '100%',
//     height: scale(50),
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: scale(25),
//     paddingHorizontal: scale(15),
//     fontSize: scaleFont(16),
//     color: '#111827',
//     borderWidth: scale(1.5),
//     borderColor: '#E5E7EB',
//   },
//   inputFocused: {
//     borderColor: '#3B82F6',
//     backgroundColor: '#F0F7FF',
//     shadowColor: '#3B82F6',
//     shadowOffset: { width: 0, height: scale(3) },
//     shadowOpacity: 0.2,
//     shadowRadius: scale(6),
//     elevation: 4,
//   },
//   pickerContainer: {
//     width: '100%',
//     height: scale(50),
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: scale(25),
//     borderWidth: scale(1.5),
//     borderColor: '#E5E7EB',
//     justifyContent: 'center',
//     overflow: 'hidden',
//   },
//   picker: {
//     width: '100%',
//     height: scale(50),
//     color: '#111827',
//     fontSize: scaleFont(16),
//   },
//   signupBtn: {
//     width: '100%',
//     height: scale(50),
//     borderRadius: scale(25),
//     marginTop: scale(10),
//     marginBottom: scale(15),
//     overflow: 'hidden',
//   },
//   disabledButton: {
//     opacity: 0.7,
//   },
//   signupBtnGradient: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   signupBtnText: {
//     color: '#FFFFFF',
//     fontSize: scaleFont(16),
//     fontWeight: 'bold',
//     letterSpacing: 0.5,
//   },
//   loginText: {
//     color: '#E5E7EB',
//     fontSize: scaleFont(14),
//     marginBottom: scale(10),
//   },
//   loginTextBold: {
//     color: '#3B82F6',
//     fontWeight: 'bold',
//   },
//   loadingText: {
//     color: '#FFFFFF',
//     fontSize: scaleFont(14),
//     textAlign: 'center',
//   },
//   errorText: {
//     color: '#FF6B6B',
//     fontSize: scaleFont(14),
//     textAlign: 'center',
//   },
//   footer: {
//     marginTop: scale(4),
//   },
//   footerText: {
//     color: 'rgba(255, 255, 255, 0.6)',
//     fontSize: scaleFont(10),
//   },
  
//   // Toast styles
//   toastContainer: {
//     width: '90%',
//     borderRadius: scale(12),
//     padding: scale(12),
//     marginHorizontal: '5%',
//     flexDirection: 'column',
//     alignItems: 'flex-start',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.27,
//     shadowRadius: 4.65,
//     elevation: 6,
//   },
//   successToast: {
//     backgroundColor: 'rgba(52, 211, 153, 0.95)',
//   },
//   errorToast: {
//     backgroundColor: 'rgba(248, 113, 113, 0.95)',
//   },
//   infoToast: {
//     backgroundColor: 'rgba(96, 165, 250, 0.95)',
//   },
//   toastTitle: {
//     fontSize: scaleFont(16),
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: scale(4),
//   },
//   toastMessage: {
//     fontSize: scaleFont(14),
//     color: '#FFFFFF',
//   },
// });











import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

import axios from 'axios';

// Get initial window dimensions
const { width, height } = Dimensions.get('window');

// Function to scale sizes based on screen width
const scale = (size) => {
  return (size * width) / 375;
};
// Function to scale font sizes
const scaleFont = (size) => {
  return Math.round((size * Math.min(width, height)) / 375);
};

// Custom toast configurations
const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
    </View>
  ),
  error: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
    </View>
  ),
  info: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
    </View>
  ),
};

// Reusable toast function
const showToast = (message, type = 'error') => {
  Toast.show({
    type: type,
    text1: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: Platform.OS === 'ios' ? 50 : 30,
  });
};

export default function Signup({ navigation, url }) {
  const [form, setForm] = useState({
    studentname: '',
    cnic: '',
    aridno: '',
    degree: '',
    shift: '',
    semester: '',
    section: '',
    courses: '',
    classes_info: '',
    email: '',
    teacherId: '',
    teachername: '',
  });
  const [sections, setSections] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [sectionError, setSectionError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingTeacher, setIsVerifyingTeacher] = useState(false);

  const route = useRoute();
  const role = route.params?.role || 'student';

  // Shift options
  const shiftOptions = [
    { label: 'Morning', value: 'Morning' },
    { label: 'Evening', value: 'Evening' },
  ];

  // Semester options (1-10)
  const semesterOptions = Array.from({ length: 10 }, (_, i) => ({
    label: `Semester ${i + 1}`,
    value: `${i + 1}`,
  }));

  useEffect(() => {
    if (role === 'student') {
      fetchSections();
    }
  }, [role]);

  const fetchSections = async () => {
    setIsLoadingSections(true);
    setSectionError('');
    try {
      const response = await axios.get(`${url}/sections`);
      console.log('Sections response:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setSections(response.data);
      } else {
        setSectionError('No sections available.');
        showToast('No sections available from the server.', 'error');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSectionError('Failed to load sections. Please try again.');
      showToast('Failed to load sections. Please try again.', 'error');
    } finally {
      setIsLoadingSections(false);
    }
  };

  // New function to verify teacher ID
  const verifyTeacherId = async (teacherId) => {
    try {
      const response = await axios.get(`${url}/teachers`);
      if (response.data && Array.isArray(response.data)) {
        const teacherExists = response.data.some(teacher => 
          teacher.teacherid === parseInt(teacherId) || teacher.teacherid === teacherId
        );
        return teacherExists;
      }
      return false;
    } catch (error) {
      console.error('Error verifying teacher ID:', error);
      throw new Error('Failed to verify teacher ID. Please try again.');
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCNIC = (cnic) => {
    // Basic CNIC validation - 13 digits
    const cnicRegex = /^\d{13}$/;
    return cnicRegex.test(cnic);
  };

  const validateAridNo = (aridno) => {
    // Basic validation for Arid number format
    const aridRegex = /^\d{2}-arid-\d{3}$/i;
    return aridRegex.test(aridno);
  };

  const validateForm = () => {
    if (role === 'student') {
      const {
        studentname,
        cnic,
        aridno,
        email,
        section,
        semester,
        shift,
      } = form;

      if (!studentname || !aridno || !cnic || !section || !semester || !shift || !email) {
        showToast('Please fill in all required fields', 'error');
        return false;
      }

      if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
      }

      if (!validateCNIC(cnic)) {
        showToast('CNIC must be 13 digits without dashes', 'error');
        return false;
      }

      if (!validateAridNo(aridno)) {
        showToast('Invalid Arid number format (e.g., 21-arid-483)', 'error');
        return false;
      }

    } else {
      const { teachername, cnic, teacherId, email } = form;

      if (!teachername || !cnic || !teacherId || !email) {
        showToast('Please fill in all required fields', 'error');
        return false;
      }

      if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
      }

      if (!validateCNIC(cnic)) {
        showToast('CNIC must be 13 digits without dashes', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (role === 'student') {
        const {
          studentname,
          cnic,
          aridno,
          degree,
          shift,
          semester,
          section,
          courses,
          classes_info,
          email,
        } = form;

        const payload = {
          name: studentname,
          cnic,
          aridno,
          degree,
          shift,
          semester,
          section,
          courses,
          classes_info,
          email,
          role: 'student',
        };

        const response = await fetch(`${url}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          showToast('Registration successful!', 'success');
          setTimeout(() => {
            navigation.navigate('login', { role });
          }, 1500);
        } else {
          showToast(data.error || 'Registration failed. Please try again.', 'error');
        }
      } else {
        // Teacher registration - verify teacher ID first
        const { teachername, cnic, teacherId, email } = form;

        setIsVerifyingTeacher(true);
        showToast('Verifying teacher ID...', 'info');

        try {
          const teacherExists = await verifyTeacherId(teacherId);
          
          if (!teacherExists) {
            showToast('Teacher ID not found in the system. Please contact admin.', 'error');
            return;
          }

          // If teacher ID exists, proceed with registration
          const payload = {
            name: teachername,
            cnic,
            teachersNo: parseInt(teacherId),
            email,
            role: 'teacher',
          };

          const response = await fetch(`${url}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (response.ok) {
            showToast('Registration successful!', 'success');
            setTimeout(() => {
              navigation.navigate('login', { role });
            }, 1500);
          } else {
            showToast(data.error || 'Registration failed. Please try again.', 'error');
          }
        } catch (verificationError) {
          showToast(verificationError.message || 'Failed to verify teacher ID', 'error');
        } finally {
          setIsVerifyingTeacher(false);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
        style={styles.backgroundImage}
        blurRadius={3}
      >
        <LinearGradient
          colors={['rgba(25, 47, 89, 0.7)', 'rgba(10, 19, 36, 0.92)']}
          style={styles.overlay}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.card}>
                <LinearGradient
                  colors={['#4C78DB', '#3D5FBE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <Text style={styles.heading}>
                  Sign Up as <Text style={styles.roleheading}>{role === 'student' ? 'Student' : 'Teacher'}</Text> 
                </Text>
                <Text style={styles.subheading}>
                  Fill in your details to join{' '}
                  <Text style={styles.roletext}>Smart Course Planner</Text>
                </Text>

                {role === 'student' ? (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <TextInput
                        placeholder="Enter your full name"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, focusedInput === 'studentname' && styles.inputFocused]}
                        value={form.studentname}
                        onChangeText={(text) => setForm({ ...form, studentname: text })}
                        onFocus={() => setFocusedInput('studentname')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>CNIC Number</Text>
                      <TextInput
                        placeholder="Enter your CNIC (13 digits)"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, focusedInput === 'cnic' && styles.inputFocused]}
                        keyboardType="numeric"
                        value={form.cnic}
                        onChangeText={(text) => setForm({ ...form, cnic: text })}
                        onFocus={() => setFocusedInput('cnic')}
                        onBlur={() => setFocusedInput(null)}
                        maxLength={13}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Arid No</Text>
                      <TextInput
                        placeholder="e.g. 21-arid-483"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, focusedInput === 'aridno' && styles.inputFocused]}
                        value={form.aridno}
                        onChangeText={(text) => setForm({ ...form, aridno: text })}
                        onFocus={() => setFocusedInput('aridno')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Email Address</Text>
                      <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                        keyboardType="email-address"
                        value={form.email}
                        onChangeText={(text) => setForm({ ...form, email: text })}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    
                    {/* Semester Dropdown */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Semester</Text>
                      <View
                        style={[
                          styles.pickerContainer,
                          focusedInput === 'semester' && styles.inputFocused,
                        ]}
                      >
                        <Picker
                          selectedValue={form.semester}
                          onValueChange={(itemValue) => setForm({ ...form, semester: itemValue })}
                          style={styles.picker}
                          dropdownIconColor="#2c3e50"
                          onFocus={() => setFocusedInput('semester')}
                          onBlur={() => setFocusedInput(null)}
                        >
                          <Picker.Item label="Select Semester" value="" />
                          {semesterOptions.map((semester) => (
                            <Picker.Item
                              key={semester.value}
                              label={semester.label}
                              value={semester.value}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>

                    {/* Section Dropdown */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Section</Text>
                      {isLoadingSections ? (
                        <Text style={styles.loadingText}>Loading sections...</Text>
                      ) : sectionError ? (
                        <Text style={styles.errorText}>{sectionError}</Text>
                      ) : (
                        <View
                          style={[
                            styles.pickerContainer,
                            focusedInput === 'section' && styles.inputFocused,
                          ]}
                        >
                          <Picker
                            selectedValue={form.section}
                            onValueChange={(itemValue) => setForm({ ...form, section: itemValue })}
                            style={styles.picker}
                            dropdownIconColor="#2c3e50"
                            onFocus={() => setFocusedInput('section')}
                            onBlur={() => setFocusedInput(null)}
                          >
                            <Picker.Item label="Select Section" value="" />
                            {sections.map((section) => (
                              <Picker.Item
                                key={section.id}
                                label={section.sectionDisplay}
                                value={section.sectionDisplay}
                              />
                            ))}
                          </Picker>
                        </View>
                      )}
                    </View>

                    {/* Shift Dropdown */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Shift</Text>
                      <View
                        style={[
                          styles.pickerContainer,
                          focusedInput === 'shift' && styles.inputFocused,
                        ]}
                      >
                        <Picker
                          selectedValue={form.shift}
                          onValueChange={(itemValue) => setForm({ ...form, shift: itemValue })}
                          style={styles.picker}
                          dropdownIconColor="#2c3e50"
                          onFocus={() => setFocusedInput('shift')}
                          onBlur={() => setFocusedInput(null)}
                        >
                          <Picker.Item label="Select Shift" value="" />
                          {shiftOptions.map((shift) => (
                            <Picker.Item
                              key={shift.value}
                              label={shift.label}
                              value={shift.value}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <TextInput
                        placeholder="Enter your full name"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, focusedInput === 'teachername' && styles.inputFocused]}
                        value={form.teachername}
                        onChangeText={(text) => setForm({ ...form, teachername: text })}
                        onFocus={() => setFocusedInput('teachername')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>CNIC Number</Text>
                      <TextInput
                        placeholder="Enter your CNIC (13 digits)"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, focusedInput === 'cnic' && styles.inputFocused]}
                        keyboardType="numeric"
                        value={form.cnic}
                        onChangeText={(text) => setForm({ ...form, cnic: text })}
                        onFocus={() => setFocusedInput('cnic')}
                        onBlur={() => setFocusedInput(null)}
                        maxLength={13}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Teacher ID</Text>
                      <TextInput
                        placeholder="Enter your teacher ID"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, focusedInput === 'teacherId' && styles.inputFocused]}
                        value={form.teacherId}
                        onChangeText={(text) => setForm({ ...form, teacherId: text })}
                        onFocus={() => setFocusedInput('teacherId')}
                        onBlur={() => setFocusedInput(null)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Email Address</Text>
                      <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor="#9CA3AF"
                        style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                        keyboardType="email-address"
                        value={form.email}
                        onChangeText={(text) => setForm({ ...form, email: text })}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.signupBtn, (isSubmitting || isVerifyingTeacher) && styles.disabledButton]}
                  onPress={handleSubmit}
                  activeOpacity={0.7}
                  disabled={isSubmitting || isVerifyingTeacher}
                >
                  <LinearGradient
                    colors={(isSubmitting || isVerifyingTeacher) ? ['#94A3B8', '#64748B'] : ['#3B82F6', '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.signupBtnGradient}
                  >
                    <Text style={styles.signupBtnText}>
                      {isVerifyingTeacher ? 'Verifying...' : isSubmitting ? 'Submitting...' : 'Sign Up'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('login', { role })}>
                  <Text style={styles.loginText}>
                    Already have an account? <Text style={styles.loginTextBold}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 Smart Course Planner</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
        <Toast config={toastConfig} />
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: scale(40),
    marginTop: Platform.OS === 'ios' ? scale(40) : scale(20),
  },
  roleheading: {
    color: '#F59E0B',
  },
  card: {
    padding: scale(10),
    width: '100%',
    maxWidth: Math.min(width * 0.9, 420),
    backgroundColor: 'transparent',
    borderRadius: scale(24),
    alignItems: 'center',
    marginTop: scale(10),
  },
  heading: {
    fontSize: scaleFont(26),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(12),
  },
  subheading: {
    fontSize: scaleFont(14),
    color: '#E5E7EB',
    marginBottom: scale(20),
    textAlign: 'center',
    paddingHorizontal: scale(10),
  },
  roletext: {
    color: '#F59E0B',
  },
  inputContainer: {
    width: '100%',
    marginBottom: scale(15),
  },
  inputLabel: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: scale(8),
    marginLeft: scale(4),
  },
  input: {
    width: '100%',
    height: scale(50),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: scale(25),
    paddingHorizontal: scale(15),
    fontSize: scaleFont(16),
    color: '#111827',
    borderWidth: scale(1.5),
    borderColor: '#E5E7EB',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F7FF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.2,
    shadowRadius: scale(6),
    elevation: 4,
  },
  pickerContainer: {
    width: '100%',
    height: scale(50),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: scale(25),
    borderWidth: scale(1.5),
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    // height: scale(50),
    color: '#111827',
    fontSize: scaleFont(16),
  },
  signupBtn: {
    width: '100%',
    height: scale(50),
    borderRadius: scale(25),
    marginTop: scale(10),
    marginBottom: scale(15),
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  signupBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupBtnText: {
    color: '#FFFFFF',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginText: {
    color: '#E5E7EB',
    fontSize: scaleFont(14),
    marginBottom: scale(10),
  },
  loginTextBold: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: scaleFont(14),
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: scaleFont(14),
    textAlign: 'center',
  },
  footer: {
    marginTop: scale(4),
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: scaleFont(10),
  },
  
  // Toast styles
  toastContainer: {
    width: '90%',
    borderRadius: scale(12),
    padding: scale(12),
    marginHorizontal: '5%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  successToast: {
    backgroundColor: 'rgba(52, 211, 153, 0.95)',
  },
  errorToast: {
    backgroundColor: 'rgba(248, 113, 113, 0.95)',
  },
  infoToast: {
    backgroundColor: 'rgba(96, 165, 250, 0.95)',
  },
  toastTitle: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scale(4),
  },
  toastMessage: {
    fontSize: scaleFont(14),
    color: '#FFFFFF',
  },
});