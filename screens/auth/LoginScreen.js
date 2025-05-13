import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const buttonOpacity = useRef(new Animated.Value(1)).current;

  const handleButtonPressIn = () => {
    Animated.timing(buttonOpacity, {
      toValue: 0.8,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await auth().signInWithEmailAndPassword(email, password);
      console.log('Đăng nhập thành công!');
      // navigation.navigate('MainApp');
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Icon name="lock-open-outline" size={60} color="#007bff" />
        <Text style={styles.title}>Đăng nhập</Text>
      </View>

      {error && (
        <View style={styles.alert}>
          <Icon name="alert-circle-outline" size={20} color="#dc3545" style={styles.alertIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Icon name="email-outline" size={24} color="#6c757d" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={[styles.inputContainer, styles.passwordInputContainer]}>
        <Icon name="lock-outline" size={24} color="#6c757d" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.eyeIconContainer}
        >
          <Icon
            name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color="#6c757d"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
        onPressIn={handleButtonPressIn}
        onPressOut={handleButtonPressOut}
        activeOpacity={1} // Để hiệu ứng onPressIn/Out hoạt động
      >
        <Animated.View style={{ ...styles.buttonContent, opacity: buttonOpacity }}>
          <Icon name="login" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
          {loading && <ActivityIndicator color="#fff" style={styles.buttonIndicator} />}
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={() => navigation.navigate('ForgotPassword')}
        onPressIn={handleButtonPressIn}
        onPressOut={handleButtonPressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>Hoặc</Text>
        <View style={styles.separatorLine} />
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
        onPressIn={handleButtonPressIn}
        onPressOut={handleButtonPressOut}
        activeOpacity={0.8}
      >
        <Animated.View style={{ ...styles.buttonContent, opacity: buttonOpacity }}>
          <Icon name="account-plus-outline" size={24} color="#007bff" style={styles.buttonIcon} />
          <Text style={styles.registerButtonText}>Chưa có tài khoản? Đăng ký</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 10,
    color: '#6c757d',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#495057',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 16,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ced4da',
  },
  separatorText: {
    paddingHorizontal: 10,
    color: '#6c757d',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  registerButtonText: {
    color: '#007bff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  alert: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    marginRight: 10,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonIndicator: {
    marginLeft: 10,
  },
});

export default LoginScreen;