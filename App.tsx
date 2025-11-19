/**
 * React Native Copilot SDK Example App
 * Demonstrates all major features:
 * - Basic CopilotView integration
 * - useCopilot hook for sending messages and receiving events
 * - Tool registration for dynamic function calling
 * - useCopilotApi for HTTP requests
 * - Multiple configuration options
 * - Event handling
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import {
  CopilotView,
  useCopilot,
  tools,
  useCopilotApi,
  type CopilotConfig,
  type CopilotEvent,
} from 'react-native-copilot';

// ============================================================================
// Configuration
// ============================================================================

const BOT_NAME = 'RetailHelper';
const USER_TOKEN = 'demo-user-token-123';

// ============================================================================
// Main App Component
// ============================================================================

export default function App() {
  // State
  const [showCopilot, setShowCopilot] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Stable config (use useMemo to prevent unnecessary reloads)
  const config: CopilotConfig = useMemo(
    () => ({
      model: 'gpt-4o',
      style: 'friendly',
      temperature: 0.7,
      systemPrompt: 'You are a helpful retail assistant. Help customers with their shopping needs.',
      knowledgeBase: ['/faq', '/return-policy', '/shipping-info'],
      metadata: {
        appVersion: '1.0.0',
        platform: 'react-native',
      },
      ui: {
        theme: darkMode ? 'dark' : 'light',
        primaryColor: '#007AFF',
        size: 'medium',
        position: 'bottom-right',
      },
    }),
    [darkMode]
  );

  // Add log helper
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  // Register tools on mount
  useEffect(() => {
    addLog('Registering tools...');

    // Tool 1: Add item to cart
    tools.register(
      'add_item_in_cart',
      {
        type: 'object',
        properties: {
          sku: {
            type: 'string',
            description: 'Product SKU code',
          },
          qty: {
            type: 'number',
            description: 'Quantity to add',
          },
        },
        required: ['sku', 'qty'],
        description: 'Adds an item to the shopping cart',
      },
      async ({ sku, qty }) => {
        addLog(`Tool called: add_item_in_cart(sku=${sku}, qty=${qty})`);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const result = {
          success: true,
          cartTotal: 2,
          itemAdded: { sku, qty, price: 29.99 },
        };
        
        addLog(`Tool result: ${JSON.stringify(result)}`);
        return result;
      }
    );

    // Tool 2: Check order status
    tools.register(
      'check_order_status',
      {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'Order ID to check',
          },
        },
        required: ['orderId'],
        description: 'Checks the status of an order',
      },
      async ({ orderId }) => {
        addLog(`Tool called: check_order_status(orderId=${orderId})`);
        
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const result = {
          orderId,
          status: 'shipped',
          trackingNumber: 'TRACK123456',
          estimatedDelivery: '2025-11-22',
        };
        
        addLog(`Tool result: ${JSON.stringify(result)}`);
        return result;
      }
    );

    // Tool 3: Get product recommendations
    tools.register(
      'get_product_recommendations',
      {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Product category',
          },
          limit: {
            type: 'number',
            description: 'Number of recommendations',
          },
        },
        required: ['category'],
        description: 'Gets product recommendations for a category',
      },
      async ({ category, limit = 5 }) => {
        addLog(`Tool called: get_product_recommendations(category=${category}, limit=${limit})`);
        
        await new Promise((resolve) => setTimeout(resolve, 400));
        
        const products = Array.from({ length: limit as number }, (_, i) => ({
          id: `PROD${i + 1}`,
          name: `${category} Product ${i + 1}`,
          price: Math.floor(Math.random() * 100) + 20,
          rating: (Math.random() * 2 + 3).toFixed(1),
        }));
        
        addLog(`Tool result: ${products.length} products`);
        return { products, category };
      }
    );

    addLog('Tools registered successfully');

    // Cleanup
    return () => {
      tools.unregister('add_item_in_cart');
      tools.unregister('check_order_status');
      tools.unregister('get_product_recommendations');
      addLog('Tools unregistered');
    };
  }, []);

  // Copilot event handlers
  const handleReady = () => {
    addLog('✅ Copilot is ready!');
  };

  const handleEvent = (event: CopilotEvent) => {
    addLog(`Event: ${event.type}`);
    if (event.type === 'conversation.updated') {
      // addLog(`Message: ${JSON.stringify(event.data).slice(0, 100)}...`);
    }
  };

  const handleError = (error: Error) => {
    addLog(`❌ Error: ${error.message}`);
    console.error('Copilot error:', error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Copilot SDK Example</Text>
        <View style={styles.headerControls}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Copilot View */}
        {showCopilot && (
          <View style={styles.copilotContainer}>
            <Text style={styles.sectionTitle}>Copilot Widget</Text>
            <CopilotView
              botName={BOT_NAME}
              token={USER_TOKEN}
              config={config}
              style={styles.copilot}
              testID="copilot-widget"
              onReady={handleReady}
              onEvent={handleEvent}
              onError={handleError}
              backgroundColor={darkMode ? '#1c1c1e' : '#ffffff'}
            />
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <Text style={styles.sectionTitle}>Controls</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowCopilot((prev) => !prev)}
          >
            <Text style={styles.buttonText}>
              {showCopilot ? 'Hide' : 'Show'} Copilot
            </Text>
          </TouchableOpacity>

          <CopilotControls 
            customMessage={customMessage}
            setCustomMessage={setCustomMessage}
            addLog={addLog}
          />
        </View>

        {/* Logs */}
        <View style={styles.logsContainer}>
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>Event Logs</Text>
            <TouchableOpacity onPress={() => setLogs([])}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.logs}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
            {logs.length === 0 && (
              <Text style={styles.logTextEmpty}>No logs yet...</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// Copilot Controls Component (demonstrates useCopilot hook)
// ============================================================================

interface CopilotControlsProps {
  customMessage: string;
  setCustomMessage: (message: string) => void;
  addLog: (message: string) => void;
}

function CopilotControls({ customMessage, setCustomMessage, addLog }: CopilotControlsProps) {
  const { ready, status, send, on } = useCopilot();
  const api = useCopilotApi({
    baseUrl: 'https://jsonplaceholder.typicode.com',
  });

  // Subscribe to events
  useEffect(() => {
    const unsubscribe = on('conversation.updated', (event) => {
      // Handle event (already logged in parent)
    });

    return unsubscribe;
  }, [on]);

  // Quick actions
  const quickActions = [
    { label: 'Ask about returns', message: 'What is your return policy?' },
    { label: 'Check shipping', message: 'How long does shipping take?' },
    { label: 'Product recommendations', message: 'Can you recommend some electronics?' },
    { label: 'Order status', message: 'Check status of order #12345' },
  ];

  const handleQuickAction = (message: string) => {
    if (!ready) {
      Alert.alert('Not Ready', 'Copilot is not ready yet. Please wait...');
      return;
    }
    addLog(`Sending: "${message}"`);
    send(message);
  };

  const handleCustomSend = () => {
    if (!customMessage.trim()) {
      Alert.alert('Empty Message', 'Please enter a message');
      return;
    }
    if (!ready) {
      Alert.alert('Not Ready', 'Copilot is not ready yet. Please wait...');
      return;
    }
    addLog(`Sending: "${customMessage}"`);
    send(customMessage);
    setCustomMessage('');
  };

  const handleApiTest = async () => {
    addLog('Testing API executor...');
    const result = await api.execute({
      method: 'GET',
      path: '/posts/1',
    });

    if (result.error) {
      addLog(`API error: ${result.error}`);
      Alert.alert('API Error', result.error);
    } else {
      addLog(`API success: ${JSON.stringify(result.data).slice(0, 100)}...`);
      Alert.alert('API Success', 'Check logs for response');
    }
  };

  return (
    <View>
      {/* Status */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View
          style={[
            styles.statusBadge,
            ready ? styles.statusBadgeReady : styles.statusBadgeNotReady,
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.subSectionTitle}>Quick Actions</Text>
      {quickActions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickActionButton}
          onPress={() => handleQuickAction(action.message)}
        >
          <Text style={styles.quickActionText}>{action.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Custom Message */}
      <Text style={styles.subSectionTitle}>Custom Message</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter custom message..."
        value={customMessage}
        onChangeText={setCustomMessage}
        onSubmitEditing={handleCustomSend}
      />
      <TouchableOpacity style={styles.button} onPress={handleCustomSend}>
        <Text style={styles.buttonText}>Send Custom Message</Text>
      </TouchableOpacity>

      {/* API Test */}
      <TouchableOpacity style={styles.apiButton} onPress={handleApiTest}>
        <Text style={styles.buttonText}>Test API Executor</Text>
      </TouchableOpacity>
    </View>
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
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  copilotContainer: {
    flex: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#666',
  },
  copilot: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  controls: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeReady: {
    backgroundColor: '#34C759',
  },
  statusBadgeNotReady: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionButton: {
    backgroundColor: '#E5E5EA',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  quickActionText: {
    color: '#007AFF',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  apiButton: {
    backgroundColor: '#5856D6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  logsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flex: 1,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logs: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: '#333',
    marginBottom: 4,
  },
  logTextEmpty: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

