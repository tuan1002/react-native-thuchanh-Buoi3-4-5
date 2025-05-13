import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icon

const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeAppointments();
    return () => unsubscribe(); // Hủy lắng nghe khi unmount
  }, []);

  const subscribeAppointments = () => {
    setLoading(true);
    setError('');

    const currentUser = auth().currentUser;

    if (!currentUser) {
      setError('Người dùng chưa đăng nhập.');
      setLoading(false);
      return () => {};
    }

    return firestore()
      .collection('transactions')
      .where('userId', '==', currentUser.uid)
      .onSnapshot(
        snapshot => {
          const appointmentList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          // Sắp xếp lịch hẹn theo thời gian tạo mới nhất
          appointmentList.sort((a, b) => (b.createdAt?.toDate() || new Date()) - (a.createdAt?.toDate() || new Date()));
          setAppointments(appointmentList);
          setLoading(false);
        },
        error => {
          console.error('Lỗi realtime:', error);
          setError('Không thể tải lịch hẹn.');
          setLoading(false);
        }
      );
  };

  const renderItem = ({ item }) => {
    const appointmentDate = item.createdAt?.toDate();
    const formattedDate = appointmentDate ? appointmentDate.toLocaleDateString() : 'Không xác định';
    let statusColor = styles.status_pending;
    if (item.status === 'accepted') {
      statusColor = styles.status_accepted;
    } else if (item.status === 'rejected') {
      statusColor = styles.status_rejected;
    }

    return (
      <View style={styles.listItem}>
        <View style={styles.appointmentInfo}>
          <Icon name="medical-bag" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.serviceName}>
            {item.serviceName || 'Tên dịch vụ không xác định'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar-today" size={18} color="#6c757d" style={styles.detailIcon} />
          <Text style={styles.detailText}>Ngày đặt: {formattedDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="progress-check" size={18} color="#6c757d" style={styles.detailIcon} />
          <Text style={[styles.detailText, styles.statusText, statusColor]}>
            Trạng thái: {item.status || 'Đang chờ'}
          </Text>
        </View>
        {/* Thêm thông tin chi tiết khác nếu có */}
      </View>
    );
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
        <Icon name="alert-circle-outline" size={40} color="#dc3545" style={styles.errorIcon} />
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch hẹn của bạn</Text>
      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.centered}>
          <Icon name="calendar-remove-outline" size={40} color="#6c757d" style={styles.noAppointmentIcon} />
          <Text style={styles.noAppointment}>Bạn chưa có lịch hẹn nào.</Text>
        </View>
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#007bff',
  },
  listItem: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
    color: '#007bff',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 10,
    color: '#6c757d',
  },
  detailText: {
    fontSize: 16,
    color: '#495057',
  },
  statusText: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  status_pending: {
    color: '#ffc107',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  status_accepted: {
    color: '#28a745',
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  status_rejected: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  error: {
    color: '#dc3545',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 15,
  },
  errorIcon: {
    marginBottom: 15,
    color: '#dc3545',
  },
  noAppointment: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: 18,
    marginTop: 15,
  },
  noAppointmentIcon: {
    marginBottom: 15,
    color: '#6c757d',
  },
});

export default AppointmentsScreen;