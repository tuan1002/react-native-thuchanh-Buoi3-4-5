import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminProfileScreen = () => {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth().currentUser;
      if (user) {
        setEmail(user.email);
        const docSnap = await firestore().collection('admins').doc(user.uid).get();
        if (docSnap.exists) {
          const data = docSnap.data();
          setDisplayName(data.displayName || '');
        } else {
          setDisplayName(user.displayName || '');
        }
      }
    } catch (e) {
      console.error('Lỗi tải hồ sơ admin:', e);
      setError('Lỗi khi tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth().currentUser;
      if (user) {
        await firestore().collection('admins').doc(user.uid).set({ displayName }, { merge: true });
        await user.updateProfile({ displayName });
        Alert.alert('Thành công', 'Hồ sơ đã được cập nhật.');
      }
    } catch (e) {
      console.error('Lỗi cập nhật hồ sơ admin:', e);
      setError('Lỗi khi cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể đăng xuất.');
      console.error('Lỗi đăng xuất:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={48} color="#dc3545" style={styles.errorIcon} />
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hồ sơ Admin</Text>
      <View style={styles.profileInfo}>
        <View style={styles.infoItem}>
          <Icon name="email-outline" size={20} color="#6c757d" style={styles.infoIcon} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoText}>{email}</Text>
        </View>
        <View style={styles.inputItem}>
          <Icon name="account-outline" size={20} color="#6c757d" style={styles.inputIcon} />
          <Text style={styles.inputLabel}>Tên hiển thị:</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Nhập tên hiển thị"
          />
        </View>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.updateButton]}
        onPress={handleUpdateProfile}
        disabled={loading}
      >
        <Icon name="content-save-outline" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Cập nhật hồ sơ</Text>
        {loading && <ActivityIndicator color="#fff" style={styles.buttonLoadingIndicator} />}
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#343a40',
  },
  profileInfo: {
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputItem: {
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginRight: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#6c757d',
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#495057',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  updateButton: {
    backgroundColor: '#007bff',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 15,
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonLoadingIndicator: {
    marginLeft: 10,
  },
});

export default AdminProfileScreen;