# React Native Copilot SDK - Example App

This example app demonstrates all major features of the React Native Copilot SDK.

## Features Demonstrated

- ✅ Basic `<CopilotView>` integration
- ✅ `useCopilot()` hook for sending messages and receiving events
- ✅ Tool registration with 3 example tools:
  - `add_item_in_cart` - Adds items to shopping cart
  - `check_order_status` - Checks order status
  - `get_product_recommendations` - Gets product recommendations
- ✅ `useCopilotApi()` for HTTP requests
- ✅ Event logging and real-time status
- ✅ Config changes (dark mode toggle)
- ✅ Quick action buttons
- ✅ Custom message input
- ✅ Error handling

## Running the Example

### Prerequisites

- Node.js 16+
- React Native development environment set up
- iOS: Xcode and CocoaPods
- Android: Android Studio and SDK

### Installation

```bash
# From the example directory
npm install

# iOS only
cd ios && pod install && cd ..
```

### Running

```bash
# iOS
npm run ios

# Android
npm run android
```

## Usage

1. **Launch the app** - The Copilot widget will load automatically
2. **Wait for "Copilot is ready"** in the logs
3. **Try quick actions** - Pre-configured messages
4. **Send custom messages** - Type and send your own
5. **Test tools** - Ask Copilot to:
   - "Add product SKU-123 to my cart"
   - "Check the status of order #12345"
   - "Recommend some electronics"
6. **Test API executor** - Tap "Test API Executor" to make a test HTTP request
7. **Toggle dark mode** - See config changes applied smoothly

## Code Walkthrough

### Main Component (`App.tsx`)

The main component shows:
- How to set up `<CopilotView>` with proper configuration
- Event handlers: `onReady`, `onEvent`, `onError`
- Tool registration in `useEffect`
- Config management with `useMemo`
- Dark mode toggle demonstrating soft config updates

### Copilot Controls

The `CopilotControls` component demonstrates:
- `useCopilot()` hook usage
- `send()` function for sending messages
- `on()` function for event subscriptions
- Status checking with `ready` and `status`
- `useCopilotApi()` for making HTTP requests

### Tool Registration

Three example tools are registered:

```typescript
tools.register('add_item_in_cart', schema, handler);
tools.register('check_order_status', schema, handler);
tools.register('get_product_recommendations', schema, handler);
```

Each tool:
- Has a JSON Schema defining parameters
- Returns a promise with results
- Logs execution to the UI
- Simulates API calls with delays

### Event Handling

Events are logged in real-time:
- `conversation.updated` - New messages
- Tool invocations and results
- Ready state changes
- Errors

## Customization

You can customize:
- `BOT_NAME` - Your bot identifier
- `USER_TOKEN` - User authentication token
- `config` - Model, style, knowledge base, etc.
- Tools - Add your own custom tools
- API endpoint - Change `baseUrl` in `useCopilotApi`

## Testing

The example includes:
- `testID="copilot-widget"` for E2E testing
- Console logging for debugging
- UI logs for visual feedback
- Error boundaries for error handling

## Troubleshooting

### Widget not loading
- Check internet connection
- Verify script URL is accessible
- Check console for errors

### Tools not executing
- Ensure tools are registered before use
- Check tool names match exactly
- Verify schema matches arguments

### Config changes not applying
- Hard changes (model, etc.) require reload
- Soft changes (theme, etc.) apply immediately
- Use `useMemo` to prevent unnecessary updates

## Learn More

See the main SDK README for full API documentation and advanced features.

