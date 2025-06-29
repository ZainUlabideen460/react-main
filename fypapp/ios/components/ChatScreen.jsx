import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Free Hugging Face API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
const HF_API_KEY = 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with your free Hugging Face API key

export default function ChatScreen({ url, setUnreadCount = () => {} }) {
  const [user, setUser] = useState(null); // {id, role, name}
  const [token, setToken] = useState('');
  const [conversations, setConversations] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // AI Assistant virtual user
  const AI_ASSISTANT = {
    id: 'ai-assistant',
    name: 'AI Assistant',
    role: 'assistant',
    isOnline: true,
    isAI: true
  };

  // Animation for UI elements
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Helper: fetch auth token & user
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) {
          Toast.show({
            type: 'error',
            text1: 'Authentication Required',
            text2: 'Please log in to access the chat.',
          });
          return;
        }
        setToken(storedToken);

        // Fetch user info
        const userRes = await axios.get(`${url}/user`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setUser(userRes.data);

        // Fetch initial data
        await Promise.all([
          fetchConversations(storedToken),
          fetchRecipients(userRes.data, storedToken),
        ]);

        // Init socket connection
        socketRef.current = io(url, {
          transports: ['websocket'],
          withCredentials: true,
        });
        socketRef.current.on('connect', () => {
          socketRef.current.emit('authenticate', userRes.data.id);
          setUnreadCount(0);
        });
        socketRef.current.on('newMessage', handleIncomingMessage);
        socketRef.current.on('messageSent', handleIncomingMessage);
        socketRef.current.on('userStatus', handleUserStatus);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Initialization Error',
          text2: err?.response?.data?.message || 'Failed to initialize chat.',
        });
      }
    })();

    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle user online/offline status
  const handleUserStatus = (statusData) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === statusData.userId ? { ...r, isOnline: statusData.isOnline } : r,
      ),
    );
    setFilteredRecipients((prev) =>
      prev.map((r) =>
        r.id === statusData.userId ? { ...r, isOnline: statusData.isOnline } : r,
      ),
    );
  };

  const handleIncomingMessage = (msg) => {
    const involved = selectedRecipient && (msg.senderId === selectedRecipient.id || msg.receiverId === selectedRecipient.id);
    if (involved) {
      setMessages((prev) => [...prev, msg]);
      flatListRef.current?.scrollToEnd({ animated: true });
    } else if (msg.senderId !== user?.id) {
      setUnreadCount((prev) => prev + 1);
    }
    fetchConversations();
    if (msg.senderId !== user?.id) {
      Toast.show({
        type: 'info',
        text1: `New Message from ${msg.senderName || 'User'}`,
        text2: msg.message,
      });
    }
  };

  // Fetch conversations
  const fetchConversations = async (tok = token) => {
    try {
      const res = await axios.get(`${url}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      setConversations(res.data);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load conversations.',
      });
    }
  };

  // Fetch allowed recipients based on role matrix + add AI assistant
  const fetchRecipients = async (usr, tok = token) => {
    if (!usr) return;
    const rolesToFetch = usr.role === 'student' ? ['teacher'] : usr.role === 'teacher' ? ['teacher', 'student'] : ['teacher'];
    try {
      let list = [];
      for (const r of rolesToFetch) {
        const res = await axios.get(`${url}/api/chat/users/${r}`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        list = list.concat(res.data.map((user) => ({ ...user, isOnline: false })));
      }
      
      // Add AI Assistant to the list
      list.unshift(AI_ASSISTANT);
      
      setRecipients(list);
      setFilteredRecipients(list);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load recipients.',
      });
    }
  };

  // Search recipients
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredRecipients(recipients);
    } else {
      const filtered = recipients.filter((r) =>
        r.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredRecipients(filtered);
    }
  };

  // Load AI conversation from AsyncStorage
  const loadAiConversation = async () => {
    try {
      const aiMessages = await AsyncStorage.getItem(`ai_chat_${user.id}`);
      return aiMessages ? JSON.parse(aiMessages) : [];
    } catch (err) {
      console.error('Failed to load AI conversation:', err);
      return [];
    }
  };

  // Save AI conversation to AsyncStorage
  const saveAiConversation = async (messages) => {
    try {
      await AsyncStorage.setItem(`ai_chat_${user.id}`, JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save AI conversation:', err);
    }
  };

  // Generate AI response using Hugging Face API
  const generateAiResponse = async (userMessage, conversationHistory = []) => {
    try {
      setIsAiTyping(true);
      
      // Prepare conversation context
      let context = conversationHistory.slice(-6).map(msg => msg.message).join(' ');
      context += ` ${userMessage}`;

      const response = await axios.post(
        HF_API_URL,
        {
          inputs: context,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      let aiResponse = '';
      if (response.data && response.data[0] && response.data[0].generated_text) {
        // Extract only the new part of the response
        const fullResponse = response.data[0].generated_text;
        aiResponse = fullResponse.replace(context, '').trim();
        
        // Clean up the response
        if (aiResponse.length === 0) {
          aiResponse = getRandomFallbackResponse();
        }
      } else {
        aiResponse = getRandomFallbackResponse();
      }

      return aiResponse;
    } catch (error) {
      console.error('AI API Error:', error);
      return getRandomFallbackResponse();
    } finally {
      setIsAiTyping(false);
    }
  };

  // Fallback responses when AI API fails
  const getRandomFallbackResponse = () => {
    const fallbackResponses = [
      "I'm here to help! What would you like to know?",
      "That's interesting! Can you tell me more?",
      "I understand. How can I assist you further?",
      "Thanks for sharing that with me!",
      "I'm processing your message... Could you be more specific?",
      "That's a great question! Let me think about that.",
      "I'm here to help with any questions you have.",
      "Tell me more about what you're thinking.",
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  // Open conversation / fetch messages
  const openConversation = async (participant) => {
    setSelectedRecipient(participant);
    setSearchQuery('');
    setFilteredRecipients(recipients);
    setUnreadCount(0);
    
    if (participant.isAI) {
      // Load AI conversation from local storage
      const aiMessages = await loadAiConversation();
      setMessages(aiMessages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } else {
      // Load regular user conversation from server
      try {
        const res = await axios.get(`${url}/api/chat/messages/${participant.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load messages.',
        });
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedRecipient) return;
    
    const userMessage = {
      id: Date.now(),
      senderId: user.id,
      receiverId: selectedRecipient.id,
      senderName: user.name,
      message: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };

    if (selectedRecipient.isAI) {
      // Handle AI conversation
      setMessages((prev) => [...prev, userMessage]);
      setMessageInput('');
      flatListRef.current?.scrollToEnd({ animated: true });
      
      // Generate AI response
      const aiResponse = await generateAiResponse(messageInput.trim(), messages);
      
      const aiMessage = {
        id: Date.now() + 1,
        senderId: AI_ASSISTANT.id,
        receiverId: user.id,
        senderName: AI_ASSISTANT.name,
        message: aiResponse,
        timestamp: new Date().toISOString(),
      };
      
      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      await saveAiConversation(updatedMessages);
      flatListRef.current?.scrollToEnd({ animated: true });
      
    } else {
      // Handle regular user conversation
      try {
        const res = await axios.post(
          `${url}/api/chat/send`,
          { receiverId: selectedRecipient.id, message: messageInput.trim() },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMessageInput('');
        setMessages((prev) => [...prev, res.data]);
        flatListRef.current?.scrollToEnd({ animated: true });
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to send message.',
        });
      }
    }
  };

  // Clear AI conversation
  const clearAiConversation = () => {
    Alert.alert(
      'Clear AI Conversation',
      'Are you sure you want to clear all messages with AI Assistant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setMessages([]);
            await AsyncStorage.removeItem(`ai_chat_${user.id}`);
            Toast.show({
              type: 'success',
              text1: 'Conversation Cleared',
              text2: 'AI conversation has been cleared.',
            });
          },
        },
      ]
    );
  };

  // UI helpers
  const renderConversation = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => openConversation(item.user)}
      >
        <View style={[styles.avatar, item.user.isAI && styles.aiAvatar]}>
          <Text style={styles.avatarText}>
            {item.user.isAI ? '🤖' : item.user.name[0]}
          </Text>
          {item.user.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.conversationContent}>
          <Text style={styles.conversationName}>{item.user.name}</Text>
          <Text numberOfLines={1} style={styles.conversationPreview}>
            {item.lastMessage?.content || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderMessage = ({ item }) => {
    const isSelf = item.senderId === user?.id;
    const isAiMessage = item.senderId === AI_ASSISTANT.id;
    
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[
          styles.messageBubble, 
          isSelf ? styles.self : styles.other,
          isAiMessage && styles.aiMessage
        ]}>
          {isAiMessage && (
            <Text style={styles.aiLabel}>🤖 AI Assistant</Text>
          )}
          <Text style={[
            styles.msgText, 
            isSelf ? styles.msgTextSelf : styles.msgTextOther
          ]}>
            {item.message}
          </Text>
          <Text style={styles.msgTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Ionicons name="chatbubble-outline" size={40} color="#25D366" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        {selectedRecipient ? (
          <>
            <TouchableOpacity onPress={() => setSelectedRecipient(null)}>
              <Ionicons name="arrow-back" size={24} color="#25D366" />
            </TouchableOpacity>
            <View style={styles.headerUser}>
              <Text style={styles.headerTitle}>
                {selectedRecipient.isAI ? '🤖 ' : ''}{selectedRecipient.name}
              </Text>
              <Text style={styles.headerStatus}>
                {selectedRecipient.isAI 
                  ? (isAiTyping ? 'Typing...' : 'AI Assistant') 
                  : (selectedRecipient.isOnline ? 'Online' : 'Offline')
                }
              </Text>
            </View>
            {selectedRecipient.isAI && (
              <TouchableOpacity onPress={clearAiConversation} style={styles.clearBtn}>
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.headerTitle}>Chats</Text>
        )}
      </View>

      {/* Search Bar */}
      {selectedRecipient === null && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search contacts..."
              placeholderTextColor="#999"
            />
          </View>
        </Animated.View>
      )}

      {/* Conversations list */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item, idx) => `conv-${idx}`}
          horizontal
          style={styles.conversationList}
          showsHorizontalScrollIndicator={false}
        />
      </Animated.View>

      {/* Recipient picker */}
      {selectedRecipient === null && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <FlatList
            data={filteredRecipients}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recipientBtn} onPress={() => openConversation(item)}>
                <View style={[styles.avatar, item.isAI && styles.aiAvatar]}>
                  <Text style={styles.avatarText}>
                    {item.isAI ? '🤖' : item.name[0]}
                  </Text>
                  {item.isOnline && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.recipientContent}>
                  <Text style={styles.recipientText}>
                    {item.isAI ? '🤖 ' : ''}{item.name}
                  </Text>
                  <Text style={styles.recipientRole}>{item.role}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => `rec-${item.id}`}
            style={styles.recipientList}
          />
        </Animated.View>
      )}

      {/* Messages */}
      {selectedRecipient && (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, idx) => `msg-${idx}`}
            style={styles.messageList}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          {isAiTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>🤖 AI is typing...</Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Input */}
      {selectedRecipient && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder={selectedRecipient.isAI ? "Ask AI anything..." : "Type a message..."}
            placeholderTextColor="#999"
            multiline={true}
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendBtn, 
              (!messageInput.trim() || isAiTyping) && styles.sendBtnDisabled
            ]}
            disabled={!messageInput.trim() || isAiTyping}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC',
  },
  loadingText: {
    fontSize: 18,
    color: '#1A202C',
    marginTop: 10,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerUser: {
    marginLeft: 10,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  headerStatus: {
    fontSize: 14,
    color: '#25D366',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1A202C',
  },
  searchIcon: {
    marginRight: 10,
  },
  conversationList: {
    maxHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  conversationItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 10,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  conversationPreview: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  recipientList: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  recipientBtn: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recipientContent: {
    marginLeft: 10,
  },
  recipientText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  recipientRole: {
    fontSize: 14,
    color: '#718096',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageBubble: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 12,
    maxWidth: '75%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  self: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  other: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  aiMessage: {
    backgroundColor: '#E8F4FD',
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  aiLabel: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 4,
  },
  msgText: {
    fontSize: 16,
  },
  msgTextSelf: {
    color: '#1A202C',
  },
  msgTextOther: {
    color: '#1A202C',
  },
  msgTime: {
    fontSize: 12,
    color: '#718096',
    marginTop: 5,
    textAlign: 'right',
  },
  typingIndicator: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E8F4FD',
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  typingText: {
    color: '#4A90E2',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    color: '#1A202C',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendBtn: {
    backgroundColor: '#25D366',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#A0AEC0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiAvatar: {
    backgroundColor: '#4A90E2',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#25D366',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
});