import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { View, Text, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };
  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View>
        <Text>Tab [hjhjh]</Text>
      </View>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>SignOut</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
