import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MyUserContext } from '@/components/userContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import io from 'socket.io-client';
import { Stack } from 'expo-router';


const generateRoomId = (currentUserId, otherUserId, productName) => {
  const sortedUserIds = [currentUserId, otherUserId].sort();
  return `${sortedUserIds.join('-')}-${productName}`;
};


const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState('');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const { user } = useContext(MyUserContext);
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef();
  const socketRef = useRef(null);
  const roomIdRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const otherUserId = params.otherUserId;
  const productName = params.productName;
  const currentUserId = user?._id;
  const productId = params.item?._id  ;
  const SOCKET_URL = 'http://192.168.1.17:5001' || 'http://localhost:5001';

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    viewableItems.forEach(({ item }) => {
      if (item.senderId !== currentUserId && !item.isRead) {
        markMessageAsRead(item.id);
      }
    });
  }, [currentUserId]);

  useEffect(() => {
    // Generate roomId with product name
    if (currentUserId && otherUserId && productName) {
      roomIdRef.current = generateRoomId(currentUserId, otherUserId, productName);
      console.log('Generated RoomId:', roomIdRef.current);
    }
  }, [currentUserId, otherUserId, productName]);

  const loadPreviousMessages = async () => { 
    try { 
      const url = `${SOCKET_URL}/api/chats/messages?roomId=${roomIdRef.current}&productName=${productName}`;
      
      const response = await fetch(url, { 
        method: 'GET', 
        headers: { 
          'Content-Type': 'application/json', 
        }
      }); 
       
      const data = await response.json();
       
      if (response.ok && data.success) {
        const sortedMessages = data.messages
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) 
          .map(msg => ({ 
            ...msg, 
            id: `${msg.timestamp}-${msg.senderId}` ,
            status : 'read'
          })); 
       
        setMessages(sortedMessages); 
       
        setTimeout(() => { 
          if (flatListRef.current) { 
            flatListRef.current.scrollToEnd({ animated: false }); 
          } 
        }, 100); 
      } else {
        console.error('No messages Found:', data.message);
        // Alert.alert('Error', data.message || 'Failed to load previous messages');
      }
    } catch (error) { 
      console.error('Detailed error loading messages:', error); 
      Alert.alert('Error', error.message || 'Failed to load previous messages'); 
    } 
  };

  const connectSocket = () => {
    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: 10000
      });
  
      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully:', socketRef.current.id);
        
        // Emit join event with complete room information
        socketRef.current.emit('join', {
          userId: currentUserId,
          otherUserId: otherUserId,
          roomId: roomIdRef.current,
          productName: productName
        });
      });
  
      socketRef.current.on('joined', (data) => {
        console.log('Joined room successfully:', data);
        
        setIsConnected(true);
        setConnectionError('');
        setIsLoading(false);
        setReconnectAttempts(0);
  
        // Load previous messages after successful join
        loadPreviousMessages();
      });
  
      // Listen for chat messages
      socketRef.current.on('chatMessage', (messageData) => {
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(msg => 
            msg.timestamp === messageData.timestamp && 
            msg.senderId === messageData.senderId
          );
          
          if (messageExists) {
            return prevMessages;
          }
          
          const newMessage = {
            ...messageData,
            id: `${messageData.timestamp}-${messageData.senderId}`,
            status: messageData.senderId === currentUserId ? 'sent' : 'unread'  // Set initial status
          };
          
          return [...prevMessages, newMessage];
        });

        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);

        if (messageData.senderId !== currentUserId) {
          toast.success(`New message from ${messageData.senderName}: ${messageData.content}`, {
            duration: 5000,
          });
        }
        
      });
  
      // Listen for typing indicators
      socketRef.current.on('userTyping', (data) => {
        if (data.userId !== currentUserId) {
          setIsOtherUserTyping(data.isTyping);
        }
      });
  
      // Listen for read receipts
      
      socketRef.current.on('messageReadConfirmation', (readData) => {
        console.log('Received messageReadConfirmation:', readData);
  
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId === currentUserId && msg.id === readData.messageId 
        ? { ...msg, status: 'read' } 
              : msg
          )
        );
      });
      
  
      // Error handling remains same
      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        handleConnectionError(error);
      });
  
      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        setReconnectAttempts(0);
        setConnectionError('');
      });
  
      socketRef.current.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
        setReconnectAttempts(prev => prev + 1);
      });
  
    } catch (error) {
      console.error('Socket initialization error:', error);
      handleConnectionError(error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Waiting for connection to chat server...');
      return;
    }
  
    if (newMessage.trim()) {
      const messageData = {
        senderId: currentUserId,
        recipientId: otherUserId,
        productName: productName,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        roomId: roomIdRef.current,
        id: `${new Date().toISOString()}-${currentUserId}`, // Add unique id
        status: 'sent'  // Add initial status
      };
  
      try {
        // Optimistically add message to UI
        setMessages(prevMessages => [...prevMessages, messageData]);
        
        // Clear input immediately for better UX
        setNewMessage('');
        
        // Save to database
        const response = await fetch(`${SOCKET_URL}/api/chats/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData)
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.message || 'Failed to save message');
        }
  
        // Emit message through socket
        socketRef.current.emit('chatMessage', messageData);
        
        // Scroll to bottom
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        // Remove the optimistically added message on error
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== messageData.id)
        );
        Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
      }
    }
  };
  // Add these new functions for typing indicators and read receipts
  const handleTypingStart = () => {
    socketRef.current.emit('typing', {
      roomId: roomIdRef.current,
      userId: currentUserId
    });
  };
  
  const handleTypingStop = () => {
    socketRef.current.emit('stopTyping', {
      roomId: roomIdRef.current,
      userId: currentUserId
    });
  };
  
 
  const handleMessageRead = (messageId) => {
    if (!socketRef.current) return;

    socketRef.current.emit('messageRead', {
      roomId: roomIdRef.current,
      messageId: messageId,
      readerId: currentUserId
    });

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      )
    );
  };
  
  
  useEffect(() => {
    const unreadMessages = messages.filter(
      msg => msg.senderId !== currentUserId && msg.status !== 'read'
    );
    
    unreadMessages.forEach(msg => {
      handleMessageRead(msg.id);
    });
  }, [messages]);
  

  
  const handleConnectionError = (error) => {
    setConnectionError(`Connection failed: ${error.message}`);
    setIsConnected(false);
    setIsLoading(false);
    
    setReconnectAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= MAX_RECONNECT_ATTEMPTS) {
        Alert.alert(
          'Connection Failed',
          'Unable to connect to chat server. Please check your internet connection.',
          [
            { 
              text: 'Retry', 
              onPress: () => {
                setReconnectAttempts(0);
                setIsLoading(true);
                connectSocket();
              }
            },
            { 
              text: 'Go Back', 
              onPress: () => router.back(), 
              style: 'cancel'
            }
          ]
        );
      }
      return newAttempts;
    });
  };

  useEffect(() => {
    if (!otherUserId || !currentUserId || productId) {
      console.error('Missing required params:', {
        otherUserId,
        currentUserId,
        productName,
      });
      Alert.alert(
        'Error', 
        'Missing required information for chat',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUserId, otherUserId]);

  const renderItem = ({ item }) => { 
    const isOwnMessage = item.senderId === currentUserId; 
    const isRead = item.status === 'read';
    
    //console.log('Message Details:', {
      //  isRead: isRead,
    
   // });
     
    return ( 
      <View 
        style={[ 
          styles.messageContainer, 
          isOwnMessage ? styles.sentMessage : styles.receivedMessage, 
        ]} 
      > 
        <Text style={[styles.messageText, !isOwnMessage && styles.receivedMessageText]}> 
          {item.content} 
        </Text> 
        <View style={styles.timestampContainer}> 
          <Text style={[styles.timestamp, isOwnMessage ? styles.sentTimestamp : styles.receivedTimestamp]}> 
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit', 
            })} 
          </Text> 
 
          {isOwnMessage && ( 
            <Ionicons 
              name="checkmark-done" 
              size={16} 
              color={item.status === 'read' ? '#34B7F1' : '#8696A0'}
              style={styles.checkmark} 
            /> 
          )} 
        </View> 
      </View> 
    ); 
};
  
    
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false,  // Completely hide default header
        title: '' 
      }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {productName || 'Chat'}
        </Text>
      </View>

      {/* Rest of the chat UI */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#075E54" />
          <Text style={styles.loadingText}>Connecting to chat...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ref={flatListRef}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />
          
          {isOtherUserTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Typing...</Text>
            </View>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.footer}
          >
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={(text) => {
                setNewMessage(text);
                // Only emit typing if the user is actually typing
                if (text.length > 0) {
                  handleTypingStart();
                } else {
                  handleTypingStop();
                }
              }}
              multiline
              maxLength={1000}
              placeholder="Type your message..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              onPress={handleSendMessage} 
              style={styles.sendButton}
              disabled={!isConnected || !newMessage.trim()}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={!isConnected || !newMessage.trim() ? '#ccc' : '#fff'} 
              />

            </TouchableOpacity>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#000',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    borderTopRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  receivedMessageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  sentTimestamp: {
    color: '#e0e0e0',
    textAlign: 'right',
  },
  receivedTimestamp: {
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100, // Increased max height
  },
  sendButton: {
    backgroundColor: '#000',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingIndicator: {
    padding: 8,
    paddingHorizontal: 16,
  },
  typingText: {
    color: '#666',
    fontStyle: 'italic',
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  checkmark: {
    marginLeft: 5,  // Space between checkmark and timestamp
    marginTop:2,   // Slightly adjust the position
    transform: [{ rotate: '0deg' }],  // You can modify the rotation angle if you want to adjust its orientation
  },
});


export default ChatScreen;