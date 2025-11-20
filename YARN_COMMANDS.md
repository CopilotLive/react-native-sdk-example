# Running the Example App with Yarn

## 🚀 Quick Start

### Install Dependencies

```bash
cd /Users/rajjadon/copilot/mobile-sdk-react-native-client/example
yarn install
```

### Install iOS Dependencies (CocoaPods)

```bash
cd ios && pod install && cd ..
```

## 📱 Running on iOS

### Simulator
```bash
yarn ios
```

### Physical Device
```bash
yarn ios --device "Your iPhone Name"
```

### Or open in Xcode
```bash
open ios/CopilotExample.xcworkspace
```

## 🤖 Running on Android

### Emulator or Device
```bash
yarn android
```

## 🛠️ Development Commands

### Start Metro Bundler
```bash
yarn start
```

### Run Linter
```bash
yarn lint
```

### Run Tests
```bash
yarn test
```

### Clear Cache (if needed)
```bash
# Kill Metro
lsof -ti:8081 | xargs kill -9

# Clean builds
cd android && ./gradlew clean && cd ..
cd ios && rm -rf build && cd ..

# Clear Metro cache
yarn start --reset-cache
```

## 📝 Common Issues

### Port 8081 in use
```bash
lsof -ti:8081 | xargs kill -9
yarn start
```

### iOS build fails
```bash
cd ios
pod deintegrate
pod install
cd ..
yarn ios
```

### Android build fails
```bash
cd android
./gradlew clean
cd ..
yarn android
```

### Reset everything
```bash
# Remove all dependencies and reinstall
rm -rf node_modules
rm yarn.lock
yarn install

# iOS
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Android
cd android
./gradlew clean
cd ..
```

## 🎯 Device Setup

### iOS Physical Device
1. Connect iPhone/iPad via USB
2. Trust computer on device
3. In Xcode:
   - Open `ios/CopilotExample.xcworkspace`
   - Select your device
   - Signing & Capabilities → Select Team
   - Press Run (⌘R)

### Android Physical Device
1. Enable Developer Mode on device:
   - Settings → About Phone → Tap Build Number 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Verify connection: `adb devices`
5. Run: `yarn android`

## 📦 Package Scripts

All available yarn commands:

- `yarn android` - Run on Android
- `yarn ios` - Run on iOS simulator
- `yarn start` - Start Metro bundler
- `yarn lint` - Run ESLint
- `yarn test` - Run Jest tests

## 🔍 Debugging

### View React Native logs
```bash
# iOS
yarn ios --verbose

# Android
yarn android --verbose
# or
adb logcat
```

### Enable remote debugging
- Shake device → "Debug"
- Opens debugger at: http://localhost:8081/debugger-ui

### Inspect element
- Shake device → "Show Inspector"

