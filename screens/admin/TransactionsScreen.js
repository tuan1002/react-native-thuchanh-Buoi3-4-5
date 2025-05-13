import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('transactions')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const transactionList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
          }));
          setTransactions(transactionList);
          setLoading(false);
        },
        error => {
          setError('Không thể tải giao dịch.');
          setLoading(false);
          console.error('Lỗi khi tải giao dịch:', error);
        }
      );

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (status) => {
    if (!selectedTransaction) return;
    try {
      await firestore().collection('transactions').doc(selectedTransaction.id).update({ status });
      Alert.alert('Thành công', `Đã cập nhật trạng thái thành "${status}"`);
      setModalVisible(false);
    } catch (e) {
      console.error('Lỗi cập nhật trạng thái:', e);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return 'Không có';
    }
    try {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      console.error('Lỗi định dạng ngày:', error);
      return date.toLocaleString(); // Fallback to default toLocaleString
    }
  };

  const formatDateFull = (date) => {
    if (!date) {
      return 'Không có';
    }
    try {
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: vi });
    } catch (error) {
      console.error('Lỗi định dạng ngày đầy đủ:', error);
      return date.toLocaleString(); // Fallback to default toLocaleString
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setSelectedTransaction(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.itemHeader}>
        <Icon name="account-circle-outline" size={24} color="#007bff" style={styles.icon} />
        <Text style={styles.userName}>{item.userName}</Text>
      </View>
      <Text style={styles.serviceName}>Dịch vụ: {item.serviceName}</Text>
      <Text style={styles.date}>
        Ngày: {formatDate(item.createdAt)}
      </Text>
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, styles[`status_${item.status}`]]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách giao dịch</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {selectedTransaction && (
              <>
                <Text style={styles.modalTitle}>Chi tiết giao dịch</Text>
                <View style={styles.modalDetail}>
                  <Icon name="account" size={28} color="#007bff" style={styles.detailIcon} />
                  <Text style={styles.detailText}>Khách: {selectedTransaction.userName}</Text>
                </View>
                <View style={styles.modalDetail}>
                  <Icon name="email" size={28} color="#6c757d" style={styles.detailIcon} />
                  <Text style={styles.detailText}>Email: {selectedTransaction.userEmail}</Text>
                </View>
                <View style={styles.modalDetail}>
                  <Icon name="wrench" size={28} color="#28a745" style={styles.detailIcon} />
                  <Text style={styles.detailText}>Dịch vụ: {selectedTransaction.serviceName}</Text>
                </View>
                <View style={styles.modalDetail}>
                  <Icon name="tag" size={28} color="#fd7e14" style={styles.detailIcon} />
                  <Text style={styles.detailText}>Giá: {selectedTransaction.price}</Text>
                </View>
                <View style={styles.modalDetail}>
                  <Icon name="calendar-clock" size={28} color="#000" style={styles.detailIcon} />
                  <Text style={styles.detailText}>
                    Ngày: {formatDateFull(selectedTransaction.createdAt)}
                  </Text>
                </View>
                <View style={styles.modalDetail}>
                  <Icon name="label" size={28} color="#17a2b8" style={styles.detailIcon} />
                  <Text style={styles.detailText}>Trạng thái: {selectedTransaction.status.toUpperCase()}</Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.acceptButton, styles.button]}
                    onPress={() => handleStatusUpdate('accepted')}
                  >
                    <Icon name="check" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Chấp nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectButton, styles.button]}
                    onPress={() => handleStatusUpdate('rejected')}
                  >
                    <Icon name="close" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Từ chối</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Icon name="chevron-down-circle-outline" size={30} color="#6c757d" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  listItem: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  serviceName: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  statusText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
  },
  status_pending: {
    backgroundColor: '#ffc107',
  },
  status_accepted: {
    backgroundColor: '#28a745',
  },
  status_rejected: {
    backgroundColor: '#dc3545',
  },
  error: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
  },
  modalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  detailIcon: {
    marginRight: 10,
    color: '#495057',
  },
  detailText: {
    fontSize: 16,
    color: '#495057',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: '40%',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  buttonIcon: {
    marginRight: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
  },
});

export default TransactionsScreen;
