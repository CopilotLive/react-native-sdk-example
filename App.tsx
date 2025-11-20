/**
 * Kaily React Native SDK Example App
 * Demonstrates all major features:
 * - SDK initialization with proper error handling
 * - Tool registration (single and multiple tools)
 * - Shopping cart example with dynamic tools
 * - Event handling with detailed logging
 * - Context management that updates with app state
 * - User management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  KailySDK,
  KailyWidget,
  KailyTool,
  KailyToolResult,
  KailyEvent,
  KailyEventType,
  KailyUser,
  KailyConfig,
} from 'kaily-react-native-sdk';

// ============================================================================
// Configuration
// ============================================================================

const KAILY_TOKEN = 'your-kaily-token-here'; // Replace with your actual token

// ============================================================================
// Types
// ============================================================================

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  added_at: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'event';
  message: string;
}

// ============================================================================
// Main App Component
// ============================================================================

export default function App() {
  // SDK state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // User state
  const [user, setUser] = useState<KailyUser>({
    id: 'user_123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    attributes: {
      tier: 'premium',
      joinedDate: '2024-01-15',
    },
  });

  // UI state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [statusColor, setStatusColor] = useState<'green' | 'orange' | 'red'>(
    'red',
  );

  const sdk = KailySDK.getInstance();

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, level, message }, ...prev].slice(0, 100));
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };

  const getCartItemCount = (): number => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // ============================================================================
  // Cart Operations
  // ============================================================================

  const addItemToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeItemFromCart = (productId: string): boolean => {
    const itemExists = cartItems.some(item => item.id === productId);
    if (itemExists) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
      return true;
    }
    return false;
  };

  // ============================================================================
  // Tool Definitions
  // ============================================================================

  const createTools = (): KailyTool[] => {
    // Tool 1: Add to Cart
    const addToCartTool = new KailyTool({
      name: 'add_to_cart',
      description: 'Add a product to the shopping cart',
      parameters: [
        {
          name: 'product_id',
          type: 'string',
          description: 'The ID of the product to add',
          required: true,
        },
        {
          name: 'product_name',
          type: 'string',
          description: 'The name of the product',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          description: 'The price of the product',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          description: 'The quantity to add (default: 1)',
          defaultValue: 1,
        },
      ],
      handler: async (parameters): Promise<KailyToolResult> => {
        try {
          const { product_id, product_name, price, quantity = 1 } = parameters;

          addLog(`Tool: Adding ${quantity}x ${product_name} to cart`, 'info');

          const cartItem: CartItem = {
            id: product_id as string,
            name: product_name as string,
            price: price as number,
            quantity: quantity as number,
            added_at: new Date().toISOString(),
          };

          addItemToCart(cartItem);

          // Update context
          await sdk.setContext({
            current_page: 'shopping',
            cart_count: getCartItemCount() + (quantity as number),
            user_tier: 'premium',
            last_action: 'added_to_cart',
          });

          addLog(`Success: Added ${product_name} to cart`, 'success');

          return {
            success: true,
            data: {
              product_id,
              product_name,
              quantity,
              cart_count: getCartItemCount() + (quantity as number),
              message: `Successfully added ${product_name} to your cart!`,
            },
          };
        } catch (error: any) {
          addLog(`Error: ${error.message}`, 'error');
          return {
            success: false,
            error: `Failed to add product to cart: ${error.message}`,
          };
        }
      },
    });

    // Tool 2: Get Cart Items
    const getCartItemsTool = new KailyTool({
      name: 'get_cart_items',
      description: 'Get all items currently in the shopping cart',
      parameters: [],
      handler: async (): Promise<KailyToolResult> => {
        try {
          addLog('Tool: Getting cart items', 'info');

          const cartData = {
            items: cartItems,
            count: getCartItemCount(),
            total: getCartTotal(),
            currency: 'USD',
          };

          addLog(
            `Success: Retrieved ${cartItems.length} cart items`,
            'success',
          );

          return {
            success: true,
            data: cartData,
          };
        } catch (error: any) {
          addLog(`Error: ${error.message}`, 'error');
          return {
            success: false,
            error: `Failed to get cart items: ${error.message}`,
          };
        }
      },
    });

    // Tool 3: Remove from Cart
    const removeFromCartTool = new KailyTool({
      name: 'remove_from_cart',
      description: 'Remove an item from the shopping cart',
      parameters: [
        {
          name: 'product_id',
          type: 'string',
          description: 'The ID of the product to remove',
          required: true,
        },
      ],
      handler: async (parameters): Promise<KailyToolResult> => {
        try {
          const { product_id } = parameters;

          addLog(`Tool: Removing product ${product_id} from cart`, 'info');

          const removed = removeItemFromCart(product_id as string);

          if (!removed) {
            return {
              success: false,
              error: `Product ${product_id} not found in cart`,
            };
          }

          // Update context
          await sdk.setContext({
            current_page: 'shopping',
            cart_count: getCartItemCount(),
            user_tier: 'premium',
            last_action: 'removed_from_cart',
          });

          addLog(`Success: Removed product from cart`, 'success');

          return {
            success: true,
            data: {
              product_id,
              cart_count: getCartItemCount(),
              message: `Successfully removed product from cart`,
            },
          };
        } catch (error: any) {
          addLog(`Error: ${error.message}`, 'error');
          return {
            success: false,
            error: `Failed to remove product: ${error.message}`,
          };
        }
      },
    });

    // Tool 4: Get User Info
    const getUserInfoTool = new KailyTool({
      name: 'get_user_info',
      description: 'Get current user information',
      parameters: [],
      handler: async (): Promise<KailyToolResult> => {
        try {
          addLog('Tool: Getting user info', 'info');

          addLog(`Success: Retrieved user info for ${user.name}`, 'success');

          return {
            success: true,
            data: user,
          };
        } catch (error: any) {
          addLog(`Error: ${error.message}`, 'error');
          return {
            success: false,
            error: `Failed to get user info: ${error.message}`,
          };
        }
      },
    });

    return [
      addToCartTool,
      getCartItemsTool,
      removeFromCartTool,
      getUserInfoTool,
    ];
  };

  // ============================================================================
  // SDK Initialization
  // ============================================================================

  const initializeSDK = async () => {
    if (isInitialized || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setStatusColor('orange');
    addLog('Initializing Kaily SDK...', 'info');

    try {
      const config: KailyConfig = {
        token: KAILY_TOKEN,
        debugMode: true,
        enableTelemetry: true,
        user: user,
        context: {
          current_page: 'home',
          cart_count: 0,
          user_tier: 'premium',
        },
        appearance: {
          primaryColor: '#007AFF',
          backgroundColor: '#FFFFFF',
          textColor: '#212121',
          title: 'Shopping Assistant',
          showHeader: true,
          showTimestamps: true,
        },
        voiceConfig: {
          enabled: true,
          pushToTalkEnabled: false,
          ttsEnabled: true,
          language: 'en-US',
        },
      };

      await sdk.initialize(config);
      addLog('✓ SDK initialized successfully', 'success');

      // Register tools
      addLog('Registering tools...', 'info');
      const tools = createTools();
      await sdk.registerTools(tools);
      addLog(`✓ Registered ${tools.length} tools`, 'success');

      setIsInitialized(true);
      setStatusColor('green');
      addLog('✓ Kaily SDK is ready!', 'success');
    } catch (error: any) {
      addLog(`✗ Initialization failed: ${error.message}`, 'error');
      setStatusColor('red');
      Alert.alert('Initialization Error', error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  // ============================================================================
  // Event Handling
  // ============================================================================

  useEffect(() => {
    if (!isInitialized) return;

    const eventStream = sdk.getEventStream();

    const handleEvent = (event: KailyEvent) => {
      const eventType = event.type;
      addLog(`Event: ${eventType}`, 'event');

      switch (event.type) {
        case KailyEventType.ConversationLoaded:
          addLog('✓ Chat conversation loaded', 'success');
          break;

        case KailyEventType.ConversationFailedToLoad:
          addLog(`✗ Chat failed to load: ${event.data?.message}`, 'error');
          break;

        case KailyEventType.UserMessage:
          addLog(`User: ${event.data?.message}`, 'info');
          break;

        case KailyEventType.BotMessage:
          addLog(`Bot: ${event.data?.message}`, 'info');
          break;

        case KailyEventType.Error:
          addLog(`✗ Error: ${event.data?.message}`, 'error');
          break;

        case KailyEventType.Telemetry:
          addLog(`Telemetry: ${event.data?.event_name}`, 'event');
          break;

        default:
          break;
      }
    };

    eventStream.on('event', handleEvent);

    return () => {
      eventStream.off('event', handleEvent);
    };
  }, [isInitialized]);

  // ============================================================================
  // Update Context on Cart Changes
  // ============================================================================

  useEffect(() => {
    if (isInitialized && sdk.isInitialized()) {
      sdk
        .setContext({
          current_page: 'shopping',
          cart_count: getCartItemCount(),
          cart_total: getCartTotal(),
          user_tier: 'premium',
        })
        .catch(err => {
          addLog(`Failed to update context: ${err.message}`, 'error');
        });
    }
  }, [cartItems, isInitialized]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kaily SDK Example</Text>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor:
                statusColor === 'green'
                  ? '#34C759'
                  : statusColor === 'orange'
                  ? '#FF9500'
                  : '#FF3B30',
            },
          ]}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Initialize Section */}
        {!isInitialized && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get Started</Text>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                isInitializing && styles.buttonDisabled,
              ]}
              onPress={initializeSDK}
              disabled={isInitializing}
            >
              {isInitializing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Initialize SDK</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Initialize the SDK to start using Kaily AI assistant
            </Text>
          </View>
        )}

        {/* Chat Section */}
        {isInitialized && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Assistant</Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setShowChat(!showChat)}
            >
              <Text style={styles.buttonText}>
                {showChat ? 'Close Chat' : 'Open Chat'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Shopping Cart */}
        {isInitialized && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Shopping Cart ({getCartItemCount()} items)
            </Text>
            {cartItems.length === 0 ? (
              <Text style={styles.emptyText}>Your cart is empty</Text>
            ) : (
              <>
                {cartItems.map(item => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemDetails}>
                        ${item.price.toFixed(2)} × {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.cartItemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={styles.cartTotal}>
                  <Text style={styles.cartTotalLabel}>Total:</Text>
                  <Text style={styles.cartTotalAmount}>
                    ${getCartTotal().toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* User Info */}
        {isInitialized && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Information</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userInfoLabel}>Name:</Text>
              <Text style={styles.userInfoValue}>{user.name}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userInfoLabel}>Email:</Text>
              <Text style={styles.userInfoValue}>{user.email}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userInfoLabel}>Tier:</Text>
              <Text style={styles.userInfoValue}>{user.attributes?.tier}</Text>
            </View>
          </View>
        )}

        {/* Logs Section */}
        {isInitialized && (
          <View style={styles.section}>
            <View style={styles.logsHeader}>
              <Text style={styles.sectionTitle}>Event Logs</Text>
              <TouchableOpacity onPress={clearLogs}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.logsContainer}>
              {logs.length === 0 ? (
                <Text style={styles.emptyText}>No logs yet</Text>
              ) : (
                logs.map((log, index) => (
                  <View key={index} style={styles.logEntry}>
                    <Text
                      style={[
                        styles.logLevel,
                        log.level === 'success' && styles.logLevelSuccess,
                        log.level === 'error' && styles.logLevelError,
                        log.level === 'event' && styles.logLevelEvent,
                      ]}
                    >
                      ●
                    </Text>
                    <Text style={styles.logTimestamp}>[{log.timestamp}]</Text>
                    <Text style={styles.logMessage}>{log.message}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Chat Widget Modal */}
      {showChat && isInitialized && (
        <View style={styles.chatModal}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Shopping Assistant</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <KailyWidget
            config={sdk.currentConfig!}
            bridge={sdk.getBridge()}
            onConversationLoaded={() => addLog('Chat loaded', 'success')}
            onConversationFailedToLoad={error =>
              addLog(`Chat error: ${error}`, 'error')
            }
            onClose={() => setShowChat(false)}
            style={styles.chatWidget}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cartItemDetails: {
    fontSize: 14,
    color: '#666',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  logLevel: {
    fontSize: 12,
    marginRight: 6,
    color: '#666',
  },
  logLevelSuccess: {
    color: '#34C759',
  },
  logLevelError: {
    color: '#FF3B30',
  },
  logLevelEvent: {
    color: '#007AFF',
  },
  logTimestamp: {
    fontSize: 11,
    color: '#999',
    marginRight: 8,
    fontFamily: 'Courier',
  },
  logMessage: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontFamily: 'Courier',
  },
  chatModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  chatWidget: {
    flex: 1,
  },
});
