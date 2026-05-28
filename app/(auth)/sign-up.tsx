import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth, useSignUp } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const isLoading = fetchStatus === 'fetching';

  const onSignUpPress = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
      firstName,
      lastName,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const onVerifyPress = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl('/');
          if (url.startsWith('http')) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else {
      // Check why the sign-up is not complete
      console.error('Sign-up attempt not complete:', signUp);
    }
  };

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <View className='flex-1 justify-center px-6 py-12'>
          <Image
            source={require('../../assets/images/kribb.png')}
            className='w-36 h-16 mb-8'
            resizeMode='contain'
          />
          <Text className='text-3xl font-bold text-gray-800 mb-2'>
            Verify your account
          </Text>
          <Text className='text-gray-500 mb-8'>
            We sent a code to {emailAddress}
          </Text>

          <TextInput
            className='w-full border border-gray-300 rounded-xl px-4 py-3 mb-4'
            placeholder='Enter your verification code'
            placeholderTextColor='#9CA3AF'
            value={code}
            onChangeText={setCode}
            keyboardType='numeric'
          />
          {errors.fields.code && (
            <Text className='text-red-500 mb-4'>
              {errors.fields.code.message}
            </Text>
          )}
          <TouchableOpacity
            onPress={onVerifyPress}
            disabled={isLoading}
            className='w-full bg-blue-600 py-4 rounded-xl items-center mb-4'
          >
            {isLoading ? (
              <ActivityIndicator color='white' />
            ) : (
              <Text className='text-white font-bold text-base'>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signUp.verifications.sendEmailCode()}
            className='py-2'
          >
            <Text className='text-blue-600 font-bold text-base'>
              I need a new code
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
    {
      /* <ThemedView style={styles.container}>
        <ThemedText type='title' style={styles.title}>
          Verify your account
        </ThemedText>
        <TextInput
          style={styles.input}
          value={code}
          placeholder='Enter your verification code'
          placeholderTextColor='#666666'
          onChangeText={(code) => setCode(code)}
          keyboardType='numeric'
        />
        {errors.fields.code && (
          <ThemedText style={styles.error}>
            {errors.fields.code.message}
          </ThemedText>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            fetchStatus === 'fetching' && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === 'fetching'}
        >
          <ThemedText style={styles.buttonText}>Verify</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <ThemedText style={styles.secondaryButtonText}>
            I need a new code
          </ThemedText>
        </Pressable>
      </ThemedView> */
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className='bg-white'
      keyboardShouldPersistTaps='handled'
    >
      <View className='flex-1 justify-center px-6 py-12'>
        <Image
          source={require('../../assets/images/kribb.png')}
          className='w-36 h-16 mb-8'
          resizeMode='contain'
        />
        <Text className='text-3xl font-bold text-gray-800 mb-2'>
          Create account
        </Text>
        <Text className='text-gray-500 mb-8'>Find your dream home today</Text>

        <View className='flex-row gap-3 mb-4'>
          <TextInput
            className='flex-1 border border-gray-300 rounded-xl px-4 py-3'
            placeholder='First name'
            placeholderTextColor='#9CA3AF'
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize='words'
          />
          <TextInput
            className='flex-1 border border-gray-300 rounded-xl px-4 py-3'
            placeholder='Last name'
            placeholderTextColor='#9CA3AF'
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize='words'
          />
        </View>
        <TextInput
          className='w-full border border-gray-300 rounded-xl px-4 py-3 mb-4'
          placeholder='Email address'
          placeholderTextColor='#9CA3AF'
          value={emailAddress}
          onChangeText={setEmailAddress}
          keyboardType='email-address'
          autoCapitalize='none'
        />
        {errors.fields.emailAddress && (
          <Text className='text-red-500 mb-4'>
            {errors.fields.emailAddress.message}
          </Text>
        )}

        <TextInput
          className='w-full border border-gray-300 rounded-xl px-4 py-3 mb-6'
          placeholder='Password'
          placeholderTextColor='#9CA3AF'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.fields.password && (
          <Text className='text-red-500 mb-4'>
            {errors.fields.password.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={onSignUpPress}
          disabled={isLoading}
          className='w-full bg-blue-600 py-4 rounded-xl items-center mb-4'
        >
          {isLoading ? (
            <ActivityIndicator color='white' />
          ) : (
            <Text className='text-white font-bold text-base'>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View className='flex-row justify-center'>
          <Text className='text-gray-500'>Already have an account? </Text>
          <Link href='/sign-in'>
            <Text className='text-blue-600 font-semibold'>Sign In</Text>
          </Link>
        </View>
        <View nativeID='clerk-captcha' />
      </View>
    </ScrollView>

    // <ThemedView style={styles.container}>
    //   <ThemedText type='title' style={styles.title}>
    //     Sign up
    //   </ThemedText>

    //   <ThemedText style={styles.label}>Email address</ThemedText>
    //   <TextInput
    //     style={styles.input}
    //     autoCapitalize='none'
    //     value={emailAddress}
    //     placeholder='Enter email'
    //     placeholderTextColor='#666666'
    //     onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
    //     keyboardType='email-address'
    //   />
    //   {errors.fields.emailAddress && (
    //     <ThemedText style={styles.error}>
    //       {errors.fields.emailAddress.message}
    //     </ThemedText>
    //   )}
    //   <ThemedText style={styles.label}>Password</ThemedText>
    //   <TextInput
    //     style={styles.input}
    //     value={password}
    //     placeholder='Enter password'
    //     placeholderTextColor='#666666'
    //     secureTextEntry={true}
    //     onChangeText={(password) => setPassword(password)}
    //   />
    //   {errors.fields.password && (
    //     <ThemedText style={styles.error}>
    //       {errors.fields.password.message}
    //     </ThemedText>
    //   )}
    //   <Pressable
    //     style={({ pressed }) => [
    //       styles.button,
    //       (!emailAddress || !password || fetchStatus === 'fetching') &&
    //         styles.buttonDisabled,
    //       pressed && styles.buttonPressed,
    //     ]}
    //     onPress={handleSubmit}
    //     disabled={!emailAddress || !password || fetchStatus === 'fetching'}
    //   >
    //     <ThemedText style={styles.buttonText}>Sign up</ThemedText>
    //   </Pressable>
    //   {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
    //   {errors && (
    //     <ThemedText style={styles.debug}>
    //       {JSON.stringify(errors, null, 2)}
    //     </ThemedText>
    //   )}

    //   <View style={styles.linkContainer}>
    //     <ThemedText>Already have an account? </ThemedText>
    //     <Link href='/sign-in'>
    //       <ThemedText type='link'>Sign in</ThemedText>
    //     </Link>
    //   </View>

    //   {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
    //   <View nativeID='clerk-captcha' />
    // </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    alignItems: 'center',
  },
  error: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: -8,
  },
  debug: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 8,
  },
});
