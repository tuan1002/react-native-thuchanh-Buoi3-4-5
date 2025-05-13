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

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const resetButtonOpacity = useRef(new Animated.Value(1)).current;

  const handleButtonPressIn = (opacity) => {
    Animated.timing(opacity, {
      toValue: 0.8,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = (opacity) => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await auth().sendPasswordResetEmail(email);
      setMessage('Một email đặt lại mật khẩu đã được gửi đến địa chỉ của bạn.');
    } catch (error) {
      setError(error.message);
      console.error('Lỗi gửi email đặt lại mật khẩu:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View /> {/* Để căn giữa tiêu đề */}
      </View>

      {error && (
        <View style={styles.alert}>
          <Icon name="alert-circle-outline" size={20} color="#dc3545" style={styles.alertIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {message && (
        <View style={styles.alert}>
          <Icon name="check-circle-outline" size={20} color="#28a745" style={styles.alertIcon} />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      <Text style={styles.instruction}>
        Vui lòng nhập địa chỉ email bạn đã đăng ký để đặt lại mật khẩu.
      </Text>

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

      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetPassword}
        disabled={loading}
        onPressIn={() => handleButtonPressIn(resetButtonOpacity)}
        onPressOut={() => handleButtonPressOut(resetButtonOpacity)}
        activeOpacity={1}
      >
        <Animated.View style={{ ...styles.buttonContent, opacity: resetButtonOpacity }}>
          <Icon name="send-outline" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{loading ? 'Đang gửi...' : 'Gửi email đặt lại'}</Text>
          {loading && <ActivityIndicator color="#fff" style={styles.buttonIndicator} />}
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
        <View style={styles.buttonContent}>
          <Icon name="login" size={24} color="#6c757d" style={styles.buttonIcon} />
          <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  instruction: {
    marginBottom: 30,
    textAlign: 'center',
    color: '#495057',
    fontSize: 16,
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
  resetButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6c757d',
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
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
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
    justifyContent: 'center',
  },
  alertIcon: {
    marginRight: 10,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 16,
  },
  messageText: {
    color: '#28a745',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonIndicator: {
    marginLeft: 10,
  },
});

export default ForgotPasswordScreen;