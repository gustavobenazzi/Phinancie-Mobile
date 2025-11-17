import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  View,
  Text,
} from 'react-native';

export default function FormScreen({
  title,
  subtitle,
  children,
  contentClassName = 'flex-1 justify-center p-5 bg-gray-100',
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <View className={contentClassName}>
            {title ? (
              <Text className="text-3xl font-bold text-center mb-2 text-gray-800">{title}</Text>
            ) : null}
            {subtitle ? (
              <Text className="text-base text-center mb-6 text-gray-600">{subtitle}</Text>
            ) : null}
            {children}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
