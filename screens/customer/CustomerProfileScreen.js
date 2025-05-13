import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomerProfileScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        const userDoc = await firestore()
          .collection('customers')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const data = userDoc.data();
          if (data && data.name) { // Kiểm tra dữ liệu
            setName(data.name); // Đặt tên vào state
          } else {
            setName(''); // Nếu không có tên, đặt mặc định là rỗng
          }
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
        }
      } catch (e) {
        console.error('Lỗi lấy thông tin người dùng:', e);
        Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Lỗi', 'Không tìm thấy người dùng đăng nhập.');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const currentUser = auth().currentUser;
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống.');
      return;
    }

    setLoading(true);
    try {
      await firestore()
        .collection('customers')
        .doc(currentUser.uid)
        .set({ name: name.trim() }, { merge: true });
      Alert.alert('Thành công', 'Tên đã được cập nhật.');
    } catch (e) {
      console.error('Lỗi cập nhật tên:', e);
      Alert.alert('Lỗi', 'Không thể cập nhật tên.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await auth().signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (e) {
            console.error('Lỗi đăng xuất:', e);
            Alert.alert('Lỗi', 'Không thể đăng xuất.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ của bạn</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên của bạn"
          value={name}
          onChangeText={setName}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Icon name="content-save-outline" size={24} color="#fff" style={styles.saveIcon} />
        <Text style={styles.saveText}>{loading ? 'Đang lưu...' : 'Lưu'}</Text>
        {loading && <ActivityIndicator color="#fff" style={styles.buttonLoadingIndicator} />}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ced4da',
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#495057',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  saveIcon: {
    marginRight: 10,
  },
  buttonLoadingIndicator: {
    marginLeft: 10,
  },
});

export default CustomerProfileScreen;
