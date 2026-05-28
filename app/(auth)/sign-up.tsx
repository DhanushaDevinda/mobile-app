import { useAuth, useSignUp } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  TextInput,
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
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

          // Use router.replace for app navigation on native platforms.
          // Only use window.location.href on web when navigating to external absolute URLs.
          if (Platform.OS === 'web') {
            if (url.startsWith('http')) {
              // External link on web: perform full navigation
              window.location.href = url;
            } else {
              // Internal navigation on web: use router to keep SPA behavior
              router.replace(url as Href);
            }
          } else {
            // Native (iOS/Android): always use router.replace
            router.replace(url as Href);
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
  );
}
