import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSignIn } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import signUp from './sign-up';

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');

  const onSignInPress = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
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
    } else if (signIn.status === 'needs_second_factor') {
      await signIn.mfa.sendPhoneCode();
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === 'needs_client_trust') {
      // For other second factor strategies,
      // see https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === 'email_code',
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn);
    }
  };

  const onVerifyPress = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === 'complete') {
      await signIn.finalize({
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
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn);
    }
  };

  const isLoading = fetchStatus === 'fetching';

  if (signIn.status === 'needs_client_trust') {
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
            onPress={() => signIn.mfa.sendEmailCode()}
            className='py-2'
          >
            <Text className='text-blue-600 font-bold text-base'>
              I need a new code
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      // <ThemedView style={styles.container}>
      //   <ThemedText
      //     type='title'
      //     style={[styles.title, { fontSize: 24, fontWeight: 'bold' }]}
      //   >
      //     Verify your account
      //   </ThemedText>
      //   <TextInput
      //     style={styles.input}
      //     value={code}
      //     placeholder='Enter your verification code'
      //     placeholderTextColor='#666666'
      //     onChangeText={(code) => setCode(code)}
      //     keyboardType='numeric'
      //   />
      //   {errors.fields.code && (
      //     <ThemedText style={styles.error}>
      //       {errors.fields.code.message}
      //     </ThemedText>
      //   )}
      //   <Pressable
      //     style={({ pressed }) => [
      //       styles.button,
      //       fetchStatus === 'fetching' && styles.buttonDisabled,
      //       pressed && styles.buttonPressed,
      //     ]}
      //     onPress={handleVerify}
      //     disabled={fetchStatus === 'fetching'}
      //   >
      //     <ThemedText style={styles.buttonText}>Verify</ThemedText>
      //   </Pressable>
      //   <Pressable
      //     style={({ pressed }) => [
      //       styles.secondaryButton,
      //       pressed && styles.buttonPressed,
      //     ]}
      //     onPress={() => signIn.mfa.sendEmailCode()}
      //   >
      //     <ThemedText style={styles.secondaryButtonText}>
      //       I need a new code
      //     </ThemedText>
      //   </Pressable>
      //   <Pressable
      //     style={({ pressed }) => [
      //       styles.secondaryButton,
      //       pressed && styles.buttonPressed,
      //     ]}
      //     onPress={() => signIn.reset()}
      //   >
      //     <ThemedText style={styles.secondaryButtonText}>Start over</ThemedText>
      //   </Pressable>
      // </ThemedView>
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
          Welcome back
        </Text>
        <Text className='text-gray-500 mb-8'>Sign in to your account</Text>

        <TextInput
          className='w-full border border-gray-300 rounded-xl px-4 py-3 mb-4'
          placeholder='Email address'
          placeholderTextColor='#9CA3AF'
          value={emailAddress}
          onChangeText={setEmailAddress}
          keyboardType='email-address'
          autoCapitalize='none'
        />
        {errors.fields.identifier && (
          <Text className='text-red-500 mb-4'>
            {errors.fields.identifier.message}
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
          onPress={onSignInPress}
          disabled={isLoading}
          className='w-full bg-blue-600 py-4 rounded-xl items-center mb-4'
        >
          {isLoading ? (
            <ActivityIndicator color='white' />
          ) : (
            <Text className='text-white font-bold text-base'>Sign In</Text>
          )}
        </TouchableOpacity>

        <View className='flex-row justify-center'>
          <Text className='text-gray-500'>Don&apos;t have an account? </Text>
          <Link href='/sign-up'>
            <Text className='text-blue-600 font-semibold'>Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
    // <ThemedView style={styles.container}>
    //   <ThemedText type='title' style={styles.title}>
    //     Sign in
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
    //   {errors.fields.identifier && (
    //     <ThemedText style={styles.error}>
    //       {errors.fields.identifier.message}
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
    //     <ThemedText style={styles.buttonText}>Continue</ThemedText>
    //   </Pressable>
    //   {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
    //   {errors && (
    //     <ThemedText style={styles.debug}>
    //       {JSON.stringify(errors, null, 2)}
    //     </ThemedText>
    //   )}

    //   <View style={styles.linkContainer}>
    //     <ThemedText>Don't have an account? </ThemedText>
    //     <Link href='/sign-up'>
    //       <ThemedText type='link'>Sign up</ThemedText>
    //     </Link>
    //   </View>
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
