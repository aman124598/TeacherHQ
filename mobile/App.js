import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

// Import shared logic from parent directory
import { signInWithEmail, signInWithGoogle } from '../lib/firebase/auth';

// Required for web-based authentication
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const expoExtra = Constants.expoConfig?.extra || {};
  const isExpoGo = Constants.appOwnership === 'expo';
  const expoOwner = Constants.expoConfig?.owner;
  const expoSlug = Constants.expoConfig?.slug;
    const proxyProjectName = expoOwner && expoSlug ? `@${expoOwner}/${expoSlug}` : null;
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'teacherhq',
    useProxy: isExpoGo,
      projectNameForProxy: proxyProjectName || undefined,
  });
  const expectedProjectPrefix = expoExtra.firebaseMessagingSenderId;

  const getClientPrefix = (clientId) => {
    if (typeof clientId !== 'string') return null;
    const idx = clientId.indexOf('-');
    return idx > 0 ? clientId.slice(0, idx) : null;
  };

  const isMismatchedProject = [
    expoExtra.googleAndroidClientId,
    expoExtra.googleWebClientId,
    expoExtra.googleExpoClientId,
    expoExtra.googleIosClientId,
  ]
    .filter(Boolean)
    .some((clientId) => getClientPrefix(clientId) !== expectedProjectPrefix);

  // Google Sign-In Configuration
  // Use app config values so OAuth IDs stay environment-specific.
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: expoExtra.googleAndroidClientId,
    iosClientId: expoExtra.googleIosClientId || expoExtra.googleWebClientId,
    webClientId: expoExtra.googleWebClientId,
    expoClientId: expoExtra.googleExpoClientId || expoExtra.googleWebClientId,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  });

  useEffect(() => {
    if (!isMismatchedProject) return;
    Alert.alert(
      'OAuth Configuration Mismatch',
      'Firebase project number and Google OAuth client IDs are from different projects. Use OAuth client IDs from the same Firebase project.'
    );
  }, [isMismatchedProject]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      handleGoogleLogin(id_token, access_token);
      return;
    }

    if (response?.type === 'error') {
      console.error('Google auth response error:', response.error);
      Alert.alert('Google Login Failed', response.error?.message || `Google authentication failed. Redirect URI: ${redirectUri}`);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken, accessToken) => {
    if (!idToken) {
      Alert.alert('Google Login Failed', 'No ID token received from Google. Check OAuth client IDs.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithGoogle(idToken, accessToken);
      if (result.success) {
        Alert.alert('Success', `Welcome back, ${result.user?.displayName || 'User'}!`);
      } else {
        Alert.alert('Google Login Failed', result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google Sign-in error:', error);
      Alert.alert('Error', 'An unexpected error occurred during Google sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        Alert.alert('Success', `Welcome back, ${result.user?.displayName || 'User'}!`);
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Teacher HQ</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Sign In</Text>
                <LogIn size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={() => {
              if (isExpoGo && (!expoOwner || !expoSlug)) {
                Alert.alert('OAuth Setup Required', 'Set expo.owner and expo.slug in app.json before Google sign-in in Expo Go.');
                return;
              }

              if (isExpoGo && isMismatchedProject) {
                Alert.alert(
                  'OAuth Setup Required',
                  `Add redirect URI https://auth.expo.io/@${expoOwner}/${expoSlug} to the same Google project as your Firebase app, then use that project\'s web/expo OAuth client ID.`
                );
                return;
              }

              promptAsync({ useProxy: isExpoGo });
              promptAsync({
                useProxy: isExpoGo,
                projectNameForProxy: proxyProjectName || undefined,
              });
            }}
            disabled={isLoading || !request}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity>
            <Text style={styles.signUpText}>Contact Administrator</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#666',
    fontSize: 14,
  },
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  footerText: {
    color: '#666',
  },
  signUpText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

