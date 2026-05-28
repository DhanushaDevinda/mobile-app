// components/themed-view.tsx

import { View, ViewProps, StyleSheet } from 'react-native';

export type ThemedViewProps = ViewProps;

export function ThemedView({ style, ...rest }: ThemedViewProps) {
  return <View style={[styles.default, style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    backgroundColor: '#ffffff',
  },
});
