import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

// Get initial window dimensions
const { width, height } = Dimensions.get('window');

// Function to scale sizes based on screen width
const scale = (size, baseWidth = 375) => {
  return (size * width) / baseWidth;
};

// Function to scale font sizes
const scaleFont = (size) => {
  return Math.round((size * Math.min(width, height)) / 375);
};

const AdvancedChatbot = () => {
  const [userRole, setUserRole] = useState('student'); // Mock role
  const [userId, setUserId] = useState('1'); // Mock user ID
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipients, setRecipients] = useState([
    { id: '1', name: 'Teacher 1', type: 'teacher', teachersNo: 'T001', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', name: 'Teacher 2', type: 'teacher', teachersNo: 'T002', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  ]);
  const [conversations, setConversations] = useState([
    { id: '1', name: 'Teacher 1', role: 'teacher', teachersNo: 'T001', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation for header and input
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Mock sending a message with animation
  const sendMessage = () => {
    if (!messageInput.trim() || !selectedRecipient) return;

    Animated.sequence([
      Animated.timing(inputScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(inputScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const newMessage = {
      senderId: userId,
      senderType: userRole,
      message: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, newMessage]);
    setMessageInput('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    Toast.show({
      type: 'success',
      text1: 'Message Sent',
      text2: 'Your message was delivered successfully!',
    });
  };

  // Render a single message with animation
  const renderMessage = ({ item, index }) => {
    const isSentByUser = item.senderId === userId && item.senderType === userRole;
    const messageAnim = new Animated.Value(0);

    useEffect(() => {
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ opacity: messageAnim, transform: [{ translateY: messageAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <View
          style={[
            styles.messageBubble,
            isSentByUser ? styles.sentMessage : styles.receivedMessage,
          ]}
        >
          <LinearGradient
            colors={isSentByUser ? ['#4FC3F7', '#0288D1'] : ['#81C784', '#4CAF50']}
            style={styles.messageGradient}
          >
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.messageTimestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  };

  // Render conversation list
  const renderConversationList = () => (
    <View style={styles.conversationContainer}>
      <Text style={styles.sectionTitle}>Recent Conversations</Text>
      <FlatList
        horizontal
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.conversationItem,
              selectedRecipient?.id === item.id ? styles.selectedConversation : null,
            ]}
            onPress={() =>
              setSelectedRecipient({
                id: item.id,
                name: item.name,
                type: item.role,
                teachersNo: item.teachersNo,
                avatar: item.avatar,
              })
            }
          >
            <View style={styles.conversationAvatar}>
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            </View>
            <Text style={styles.conversationName}>{item.name}</Text>
            <Text style={styles.conversationRole}>{item.role}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.conversationList}
        ListEmptyComponent={<Text style={styles.emptyText}>No recent conversations</Text>}
      />
    </View>
  );

  // Render recipient selector
  const renderRecipientSelector = () => (
    <View style={styles.recipientContainer}>
      <Text style={styles.sectionTitle}>Chat with:</Text>
      <View style={styles.recipientPicker}>
        {recipients.map((recipient) => (
          <TouchableOpacity
            key={`${recipient.id}-${recipient.type}`}
            style={[
              styles.recipientButton,
              selectedRecipient?.id === recipient.id && selectedRecipient?.type === recipient.type
                ? styles.selectedRecipient
                : null,
            ]}
            onPress={() => setSelectedRecipient(recipient)}
          >
            <Image source={{ uri: recipient.avatar }} style={styles.recipientAvatar} />
            <Text style={styles.recipientText}>
              {recipient.name} ({recipient.type})
              {recipient.teachersNo ? ` - ${recipient.teachersNo}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Ionicons name="hourglass-outline" size={60} color="#9e9e9e" />
      <Text style={styles.loadingText}>Loading chat...</Text>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={60} color="#9e9e9e" />
      <Text style={styles.emptyText}>
        {recipients.length === 0
          ? 'No recipients available.'
          : 'Select a recipient to start chatting.'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      {/* Header */}
      <Animated.View style={[ { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(10, 19, 36, 0.95)', 'rgba(25, 47, 89, 0.85)']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Chat Bot</Text>
          <Text style={styles.headerSubtitle}>
            {userRole === 'student'
              ? 'Connect with your teachers'
              : userRole === 'teacher'
              ? 'Connect with students and admins'
              : 'Connect with teachers'}
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Conversations List */}
      {conversations.length > 0 && renderConversationList()}

      {/* Recipient Selector */}
      {userRole && recipients.length > 0 && renderRecipientSelector()}

      {/* Message List */}
      <View style={styles.chatContainer}>
        {isLoading ? (
          renderLoading()
        ) : selectedRecipient ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
            contentContainerStyle={styles.messageList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color="#9e9e9e" />
                <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
              </View>
            }
          />
        ) : (
          renderEmpty()
        )}
      </View>

      {/* Message Input */}
      {selectedRecipient && (
        <Animated.View style={[styles.inputContainer, { transform: [{ scale: inputScaleAnim }] }]}>
          <LinearGradient
            colors={['#FFFFFF', '#F5F5F5']}
            style={styles.inputGradient}
          >
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message..."
              value={messageInput}
              onChangeText={setMessageInput}
              placeholderTextColor="#BDBDBD"
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <LinearGradient
                colors={['#4CAF50', '#81C784']}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="send" size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}

      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  headerGradient: {
    padding: 20,
    paddingTop:40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: scaleFont(28),
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: scaleFont(16),
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  conversationContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#263238',
    marginBottom: 12,
    marginLeft: 10,
  },
  conversationList: {
    paddingBottom: 15,
  },
  conversationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    width: scale(100),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedConversation: {
    backgroundColor: '#E1F5FE',
    borderWidth: 2,
    borderColor: '#0288D1',
  },
  conversationAvatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    overflow: 'hidden',
    marginBottom: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  conversationName: {
    fontSize: scaleFont(14),
    color: '#263238',
    textAlign: 'center',
    fontWeight: '600',
  },
  conversationRole: {
    fontSize: scaleFont(12),
    color: '#78909C',
    textAlign: 'center',
  },
  recipientContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  recipientPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recipientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedRecipient: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  recipientAvatar: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    marginRight: 10,
  },
  recipientText: {
    fontSize: scaleFont(14),
    color: '#263238',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  messageList: {
    padding: 15,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageGradient: {
    padding: 15,
    borderRadius: 15,
  },
  messageText: {
    fontSize: scaleFont(16),
    color: '#ffffff',
    fontWeight: '500',
  },
  messageTimestamp: {
    fontSize: scaleFont(12),
    color: '#E0E0E0',
    textAlign: 'right',
    marginTop: 8,
  },
  inputContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 12,
    fontSize: scaleFont(16),
    color: '#263238',
    marginRight: 12,
    maxHeight: scale(120),
    elevation: 2,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#78909C',
    fontSize: scaleFont(16),
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    color: '#78909C',
    fontSize: scaleFont(16),
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AdvancedChatbot;