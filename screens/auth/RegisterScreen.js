import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }

    if (!email.trim() || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      await firestore().collection('customers').doc(uid).set({
        name,
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('Đăng ký thành công');
      navigation.navigate('Login');
    } catch (e) {
      console.error('Lỗi đăng ký:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Icon name="account-plus-outline" size={60} color="#007bff" />
        <Text style={styles.title}>Tạo tài khoản</Text>
      </View>

      {error && (
        <View style={styles.alert}>
          <Icon name="alert-circle-outline" size={20} color="#dc3545" style={styles.alertIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Icon name="account-outline" size={24} color="#6c757d" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Họ tên"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="email-outline" size={24} color="#6c757d" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={[styles.inputContainer, styles.passwordInputContainer]}>
        <Icon name="lock-outline" size={24} color="#6c757d" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
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

      <View style={[styles.inputContainer, styles.passwordInputContainer]}>
        <Icon name="lock-check-outline" size={24} color="#6c757d" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu"
          secureTextEntry={!confirmPasswordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          style={styles.eyeIconContainer}
        >
          <Icon
            name={confirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color="#6c757d"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
        <Icon name="user-plus-outline" size={24} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</Text>
        {loading && <ActivityIndicator color="#fff" style={styles.buttonIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Icon name="login-variant" size={24} color="#6c757d" style={styles.buttonIcon} />
        <Text style={styles.loginButtonText}>Đã có tài khoản? Đăng nhập</Text>
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
  registerButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    flexDirection: 'row',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6c757d',
    flexDirection: 'row',
  },
  loginButtonText: {
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

export default RegisterScreen;