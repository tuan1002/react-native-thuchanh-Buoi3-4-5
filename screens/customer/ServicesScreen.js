import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomerServicesScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('services')
      .onSnapshot(
        snapshot => {
          const serviceList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setServices(serviceList);
          setLoading(false);
        },
        error => {
          console.error('Lỗi khi tải dịch vụ realtime:', error);
          setError('Không thể tải dịch vụ.');
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const openDetailModal = service => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const handlePlaceOrder = async service => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để đặt dịch vụ.');
      return;
    }

    Alert.alert(
      'Xác nhận đặt dịch vụ',
      `Bạn có muốn đặt dịch vụ "${service.name}" với giá ${service.price}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt',
          onPress: async () => {
            setPlacingOrder(true);
            try {
              const userDoc = await firestore()
                .collection('users')
                .doc(currentUser.uid)
                .get();

              const userData = userDoc.data();

              await firestore().collection('transactions').add({
                userId: currentUser.uid,
                userName: userData?.name || 'Không có tên',
                userEmail: userData?.email || currentUser.email || 'Không có email',
                serviceId: service.id,
                serviceName: service.name,
                price: service.price,
                status: 'pending',
                createdAt: firestore.FieldValue.serverTimestamp(),
              });

              Alert.alert(
                'Thành công',
                `Đã đặt dịch vụ "${service.name}". Chúng tôi sẽ liên hệ với bạn sớm nhất.`
              );
              setModalVisible(false);
            } catch (e) {
              console.error('Lỗi khi đặt dịch vụ:', e);
              Alert.alert('Lỗi', 'Không thể đặt dịch vụ vào lúc này.');
            } finally {
              setPlacingOrder(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => openDetailModal(item)}>
      <View style={styles.itemHeader}>
        <Icon name="wrench-outline" size={24} color="#007bff" style={styles.icon} />
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.priceContainer}>
        <Icon name="tag-outline" size={16} color="#6c757d" style={styles.priceIcon} />
        <Text style={styles.price}>Giá: {item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dịch vụ của chúng tôi</Text>
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={24} color="#dc3545" style={styles.errorIcon} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {selectedService && (
              <>
                <Text style={styles.modalTitle}>{selectedService.name}</Text>
                <View style={styles.detailItem}>
                  <Icon name="information-outline" size={20} color="#6c757d" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Mô tả:</Text>
                </View>
                <Text style={styles.detailText}>{selectedService.description}</Text>
                <View style={styles.detailItem}>
                  <Icon name="tag" size={20} color="#6c757d" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Giá:</Text>
                </View>
                <Text style={styles.detailText}>{selectedService.price}</Text>

                <TouchableOpacity
                  style={[styles.button, styles.orderButton]}
                  onPress={() => handlePlaceOrder(selectedService)}
                  disabled={placingOrder}
                >
                  <Icon name="cart-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>
                    {placingOrder ? 'Đang đặt...' : 'Đặt mua'}
                  </Text>
                  {placingOrder && <ActivityIndicator color="#fff" style={styles.buttonIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="close-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Đóng</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    marginRight: 8,
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
  },
  listContent: {
    paddingBottom: 20,
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
    color: '#007bff',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  description: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceIcon: {
    marginRight: 5,
    color: '#6c757d',
  },
  price: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#343a40',
    textAlign: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  detailIcon: {
    marginRight: 8,
    color: '#6c757d',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    textAlign: 'left',
    width: '100%',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'left',
    width: '100%',
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
  },
  orderButton: {
    backgroundColor: '#28a745',
  },
  closeButton: {
    backgroundColor: '#6c757d',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIndicator: {
    marginLeft: 10,
  },
});

export default CustomerServicesScreen;
