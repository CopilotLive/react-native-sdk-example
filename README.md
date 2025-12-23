# Kaily React Native SDK

[![npm version](https://img.shields.io/npm/v/@kailyai/react-native-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@kailyai/react-native-sdk)


A complete React Native SDK for Kaily AI chatbot integration with WebView-based AI functionality, dynamic tool registration, and comprehensive event handling.

## Features

- 🚀 **Easy Integration** - Simple initialization with minimal configuration
- 🛠️ **Dynamic Tool Registration** - Register custom tools that the AI can execute
- 📱 **Cross-Platform** - Works on both iOS and Android
- 🎨 **Customizable UI** - Fully customizable appearance and themes
- 🔊 **Voice Support** - Built-in voice input and text-to-speech capabilities
- 📡 **Event System** - Comprehensive event handling with EventEmitter
- 🔐 **User Management** - Built-in user authentication and context management
- 📦 **TypeScript Support** - Full TypeScript types for enhanced development

## Installation

> Current Version: 1.0.8


```bash
npm install @kailyai/react-native-sdk
```

or

```bash
yarn add @kailyai/react-native-sdk
```

**Note:** The SDK automatically installs its required dependencies (`react-native-webview` and `eventemitter3`).

### iOS Setup

1. **Install iOS native dependencies:**

Since the SDK uses `react-native-webview` which requires native modules, you need to install iOS pods:

```bash
cd ios
pod install
cd ..
```

2. **Add permissions to your `ios/YourApp/Info.plist`:**

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone for voice interactions with Kaily AI assistant.</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>This app uses speech recognition for voice commands with Kaily AI assistant.</string>
```

### Android Setup

Add the following permissions to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

**That's it!** The SDK automatically handles keyboard behavior on Android - no additional configuration needed.

## Quick Start

```typescript
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import {
  KailySDK,
  KailyWidget,
  KailyTool,
  KailyConfig,
} from '@kailyai/react-native-sdk';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const sdk = KailySDK.getInstance();

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      const config: KailyConfig = {
        token: 'your-kaily-token-here',
        debugMode: true,
        appearance: {
          primaryColor: '#007AFF',
          title: 'AI Assistant',
        },
      };

      await sdk.initialize(config);
      await registerTools();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  };

  const registerTools = async () => {
    const greetTool = new KailyTool({
      name: 'greet_user',
      description: 'Greet the user with a personalized message',
      parameters: [
        {
          name: 'name',
          type: 'string',
          description: 'User name',
          required: true,
        },
      ],
      handler: async (params) => {
        return {
          success: true,
          data: { message: `Hello, ${params.name}!` },
        };
      },
    });

    await sdk.registerTool(greetTool);
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => setShowChat(!showChat)}>
        <Text>Toggle Chat</Text>
      </TouchableOpacity>

      {showChat && isInitialized && (
        <KailyWidget
          config={sdk.currentConfig!}
          bridge={sdk.getBridge()}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
}
```

## Core Concepts

### SDK Initialization

The SDK follows a singleton pattern. Initialize once in your app:

```typescript
const sdk = KailySDK.getInstance();

const config: KailyConfig = {
  token: 'your-token',
  debugMode: true,
  user: {
    id: 'user_123',
    name: 'John Doe',
    email: 'john@example.com',
  },
  context: {
    current_page: 'home',
    user_tier: 'premium',
  },
  appearance: {
    primaryColor: '#007AFF',
    backgroundColor: '#FFFFFF',
    title: 'My Assistant',
    showHeader: true,
  },
  voiceConfig: {
    enabled: true,
    ttsEnabled: true,
    language: 'en-US',
  },
};

await sdk.initialize(config);
```

### Tool Registration

Tools allow the AI to execute native functions:

```typescript
const addToCartTool = new KailyTool({
  name: 'add_to_cart',
  description: 'Add a product to the shopping cart',
  parameters: [
    {
      name: 'product_id',
      type: 'string',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      defaultValue: 1,
    },
  ],
  handler: async (params) => {
    // Your logic here
    return {
      success: true,
      data: { cartCount: 5 },
    };
  },
});

// Register single tool
await sdk.registerTool(addToCartTool);

// Register multiple tools
await sdk.registerTools([tool1, tool2, tool3]);

// Unregister tool
await sdk.unregisterTool('add_to_cart');
```

### Event Handling

Listen to events from the AI:

```typescript
const eventStream = sdk.getEventStream();

eventStream.on('event', (event: KailyEvent) => {
  console.log('Event:', event.type, event.data);
});

// Listen to specific events
eventStream.on(KailyEventType.ConversationLoaded, (event) => {
  console.log('Chat loaded!');
});

eventStream.on(KailyEventType.UserMessage, (event) => {
  console.log('User said:', event.data?.message);
});

eventStream.on(KailyEventType.Error, (event) => {
  console.error('Error:', event.data?.message);
});
```

### User Management

```typescript
// Set user
await sdk.setUser({
  id: 'user_123',
  name: 'John Doe',
  email: 'john@example.com',
  attributes: {
    tier: 'premium',
  },
});

// Unset user
await sdk.unsetUser();

// Notify login success
await sdk.notifyLoginSuccess();

// Logout
await sdk.logout();
```

### Context Management

Keep the AI informed about app state:

```typescript
// Set context
await sdk.setContext({
  current_page: 'checkout',
  cart_count: 3,
  cart_total: 149.99,
  user_tier: 'premium',
});

// Update context when state changes
useEffect(() => {
  if (sdk.isInitialized()) {
    sdk.setContext({
      current_page: pageName,
      cart_count: cartItems.length,
    });
  }
}, [cartItems, pageName]);

// Unset context
await sdk.unsetContext();
```

### Sending Messages

```typescript
// Send a message programmatically
await sdk.sendMessage('What products do you recommend?');

// Send custom event
await sdk.sendGenericEvent('custom_event', {
  action: 'button_clicked',
  value: 'checkout',
});
```

### UI Actions

Control the Kaily UI programmatically:

```typescript
// Toggle the context menu
await sdk.toggleContextMenu();
```
```

## API Reference

### KailySDK

Main SDK class (singleton):

```typescript
// Get instance
const sdk = KailySDK.getInstance();

// Initialize
await sdk.initialize(config: KailyConfig): Promise<void>

// Check if initialized
sdk.isInitialized(): boolean

// Tool management
await sdk.registerTool(tool: KailyTool): Promise<void>
await sdk.registerTools(tools: KailyTool[]): Promise<void>
await sdk.unregisterTool(toolName: string): Promise<void>
sdk.getRegisteredTools(): KailyTool[]
await sdk.addFrontendTools(tools: KailyTool[]): Promise<void>
await sdk.removeFrontendTools(toolNames: string[]): Promise<void>
await sdk.removeAllTools(): Promise<void>

// User management
await sdk.setUser(user: KailyUser): Promise<void>
await sdk.unsetUser(): Promise<void>
await sdk.notifyLoginSuccess(): Promise<void>
await sdk.logout(): Promise<void>

// Context management
await sdk.setContext(context: Record<string, any>): Promise<void>
await sdk.unsetContext(): Promise<void>

// Messaging
await sdk.sendMessage(message: string): Promise<void>
await sdk.sendEvent(event: KailyEvent): Promise<void>
await sdk.sendGenericEvent(eventType: string, data: Record<string, any>): Promise<void>

// Event streams
sdk.getEventStream(): EventEmitter
sdk.getToolCallStream(): EventEmitter

// Getters
sdk.currentConfig: KailyConfig | null
sdk.currentUser: KailyUser | null
sdk.currentContext: Record<string, any> | null
sdk.hasUser: boolean

// Lifecycle
sdk.dispose(): void

// UI Actions
await sdk.toggleContextMenu(): Promise<void>
```

### KailyWidget

React component for displaying the chat interface:

```typescript
<KailyWidget
  config={config}
  bridge={sdk.getBridge()}
  onConversationLoaded={() => console.log('Loaded')}
  onConversationFailedToLoad={(error) => console.error(error)}
  onDeepLinkReceived={(url) => console.log(url)}
  onTelemetryEvent={(type, data) => console.log(type, data)}
  onClose={() => setShowChat(false)}
  onEvent={(event) => console.log(event)}
  style={{ flex: 1 }}
/>
```

### Configuration Types

#### KailyConfig

```typescript
interface KailyConfig {
  token: string; // Required
  baseUrl?: string;
  widgetUrl?: string;
  user?: KailyUser;
  appearance?: KailyAppearance;
  voiceConfig?: KailyVoiceConfig;
  debugMode?: boolean;
  enableTelemetry?: boolean;
  context?: Record<string, any>;
  headers?: Record<string, string>;
  loadTimeoutMs?: number;
  enableJsDebugging?: boolean;
  userAgent?: string;
  allowExternalNavigation?: boolean;
  callbackUrls?: string[];
  initParams?: Record<string, any>;
}
```

#### KailyUser

```typescript
interface KailyUser {
  id: string; // Required
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  attributes?: Record<string, any>;
  session?: string;
}
```

#### KailyAppearance

```typescript
interface KailyAppearance {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  userMessageColor?: string;
  botMessageColor?: string;
  borderRadius?: number;
  customCss?: string;
  fontFamily?: string;
  fontSize?: number;
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  showHeader?: boolean;
  showTimestamps?: boolean;
  darkMode?: boolean;
  themeMode?: 'light' | 'dark' | 'auto';
}
```

## Event Types

```typescript
enum KailyEventType {
  ConversationLoaded = 'conversationLoaded',
  ConversationFailedToLoad = 'conversationFailedToLoad',
  DeepLinkReceived = 'deepLinkReceived',
  Telemetry = 'telemetry',
  Close = 'close',
  ToolCall = 'toolCall',
  ToolResult = 'toolResult',
  UserMessage = 'userMessage',
  BotMessage = 'botMessage',
  Error = 'error',
  AuthChanged = 'authChanged',
  ContextUpdated = 'contextUpdated',
  VoiceInputStarted = 'voiceInputStarted',
  VoiceInputStopped = 'voiceInputStopped',
  TtsStarted = 'ttsStarted',
  TtsCompleted = 'ttsCompleted',
  WidgetResized = 'widgetResized',
  Navigation = 'navigation',
  Custom = 'custom',
}
```

## Error Handling

```typescript
import {
  KailyException,
  KailyInitializationException,
  KailyConfigurationException,
  KailyToolException,
  KailyWebViewException,
} from '@kailyai/react-native-sdk';

try {
  await sdk.initialize(config);
} catch (error) {
  if (error instanceof KailyConfigurationException) {
    console.error('Configuration error:', error.field, error.message);
  } else if (error instanceof KailyInitializationException) {
    console.error('Initialization error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Permissions

Request microphone permission for voice features:

```typescript
import { PermissionHelper } from '@kailyai/react-native-sdk';

const granted = await PermissionHelper.requestMicrophonePermission();
if (!granted) {
  Alert.alert('Permission Required', 'Microphone permission is needed for voice features', [
    { text: 'Cancel' },
    { text: 'Open Settings', onPress: () => PermissionHelper.openAppSettings() },
  ]);
}
```

## Example App

See the [example](./example) directory for a comprehensive demo app that showcases:

- SDK initialization with error handling
- Shopping cart with multiple tools
- Event logging
- Context updates
- User management
- Full UI implementation

To run the example:

```bash
cd example
yarn install

# iOS
cd ios && pod install && cd ..
yarn ios

# Android
yarn android
```

## Troubleshooting

### WebView not loading

- Ensure you have `react-native-webview` installed
- Check your network connection
- Verify your Kaily token is valid
- Enable `debugMode: true` to see detailed logs

### Tools not executing

- Ensure SDK is initialized before registering tools
- Check tool handler returns proper `KailyToolResult` format
- Enable debug mode to see tool call logs
- Verify tool names match between registration and AI calls

### Events not firing

- Ensure you subscribe to events after SDK initialization
- Check you're listening to the correct event types
- Verify WebView has loaded successfully

### Android Keyboard Overlapping Chat Input

The SDK automatically handles keyboard behavior on Android using React Native's Keyboard API. No AndroidManifest configuration needed! If you still experience issues:

1. Ensure you're using the latest version of the SDK
2. Check that the KailyWidget has proper flex styling: `style={{ flex: 1 }}`
3. Verify there are no conflicting `KeyboardAvoidingView` wrappers in your app

### Deep Links Not Working on Android

The SDK automatically handles deep link interception on Android. No additional configuration needed. If links are still redirecting:

1. Ensure you're using the latest version of the SDK
2. Check that the `onDeepLinkReceived` callback is set on your KailyWidget
3. Enable debug mode and check console logs for interception messages

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions. No additional `@types` packages needed.

## License

MIT

## Support

For issues, questions, or contributions, please visit our [GitHub repository](https://github.com/kailyai/react-native-sdk).
