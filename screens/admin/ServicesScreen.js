import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ServicesScreen = () => {
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const snapshot = await firestore().collection('services').orderBy('name').get();
      const serviceList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(serviceList);
    } catch (e) {
      setError('Ôi! Đã xảy ra lỗi khi tải dịch vụ.');
      console.error('Lỗi tải dịch vụ:', e);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setSelectedService(null);
    setName('');
    setDescription('');
    setPrice('');
    setModalVisible(true);
  };

  const openEditModal = (service) => {
    setIsEdit(true);
    setSelectedService(service);
    setName(service.name);
    setDescription(service.description);
    setPrice(String(service.price));
    setModalVisible(true);
  };

  const handleAddService = async () => {
    if (!name.trim() || !description.trim() || !price.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin dịch vụ.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await firestore().collection('services').add({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
      });
      fetchServices();
      setModalVisible(false);
    } catch (e) {
      setError('Không thể thêm dịch vụ.');
      console.error('Lỗi thêm dịch vụ:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateService = async () => {
    if (!name.trim() || !description.trim() || !price.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin dịch vụ.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await firestore().collection('services').doc(selectedService.id).update({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
      });
      fetchServices();
      setModalVisible(false);
    } catch (e) {
      setError('Không thể cập nhật dịch vụ.');
      console.error('Lỗi cập nhật dịch vụ:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = (serviceId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa dịch vụ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError('');
            try {
              await firestore().collection('services').doc(serviceId).delete();
              fetchServices();
            } catch (e) {
              setError('Không thể xóa dịch vụ.');
              console.error('Lỗi xóa dịch vụ:', e);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderRightActions = (item) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '##f8f9fa' }]}
        onPress={() => openEditModal(item)}
      >
        <Icon name="pencil" size={24} color="##FF0000" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '##f8f9fa' }]}
        onPress={() => handleDeleteService(item.id)}
      >
        <Icon name="trash-can" size={24} color="#FF0000" />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity style={styles.listItem} onPress={() => openEditModal(item)}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>
        <Text style={styles.servicePrice}>Giá: ${item.price.toFixed(2)}</Text>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý Dịch vụ</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={() => <Text style={styles.emptyText}>Chưa có dịch vụ nào. Nhấn 'Thêm Dịch vụ' để tạo mới.</Text>}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Icon name="plus" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Thêm Dịch vụ</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedService(null);
          setIsEdit(false);
          setError('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEdit ? (selectedService ? 'Sửa Dịch vụ' : 'Thêm Dịch vụ mới') : 'Chi tiết Dịch vụ'}
            </Text>
            {error && <Text style={styles.error}>{error}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Tên dịch vụ"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Mô tả"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
            <TextInput
              style={styles.input}
              placeholder="Giá"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelButton, styles.button]} onPress={() => {
                setModalVisible(false);
                setSelectedService(null);
                setIsEdit(false);
                setName('');
                setDescription('');
                setPrice('');
                setError('');
              }}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, styles.button]}
                onPress={isEdit ? handleUpdateService : handleAddService}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  isEdit ? 'Lưu' : 'Thêm'
                )}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
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
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
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
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#343a40',
  },
  serviceDescription: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
  },
  error: {
    color: '#dc3545',
    marginBottom: 15,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '90%',
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
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    fontSize: 16,
    color: '#495057',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ServicesScreen;