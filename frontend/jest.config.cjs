module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/.expo/"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/*.d.ts"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|@react-navigation|@react-native-async-storage|expo|@expo|expo-constants|expo-document-picker|expo-modules-core|nativewind|react-native-svg|react-native-safe-area-context|@react-native-community)/)"
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|webp|mp4)$": "<rootDir>/tests/mocks/fileMock.cjs",
    "\\.svg$": "<rootDir>/tests/mocks/svgMock.cjs"
  }
};
