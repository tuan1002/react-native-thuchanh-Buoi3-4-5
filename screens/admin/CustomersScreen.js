import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomersScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('customers')
      .onSnapshot(
        (querySnapshot) => {
          const customerList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCustomers(customerList);
          setLoading(false);
        },
        (e) => {
          setError('Không thể tải danh sách khách hàng.');
          setLoading(false);
          console.error('Lỗi tải danh sách khách hàng:', e);
        }
      );

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.customerInfo}>
        <Icon name="account-circle" size={24} color="#007bff" style={styles.icon} />
        <Text style={styles.customerName}>{item.name || 'Không có tên'}</Text>
      </View>
      <Text style={styles.customerDetail}>
        <Icon name="email-outline" size={16} color="#6c757d" style={styles.detailIcon} />
        {item.email || 'Không có email'}
      </Text>
      {Object.keys(item)
        .filter(key => key !== 'id' && key !== 'name' && key !== 'email')
        .map(key => {
          let value = item[key];

          if (value && typeof value === 'object' && value.toDate) {
            value = value.toDate().toLocaleString();
          }

          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }

          return (
            <Text key={key} style={styles.customerDetail}>
              <Icon name="information-outline" size={16} color="#6c757d" style={styles.detailIcon} />
              {key}: {value}
            </Text>
          );
        })}
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
        <Icon name="alert-circle-outline" size={48} color="#dc3545" style={styles.errorIcon} />
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (customers.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="account-off-outline" size={48} color="#6c757d" style={styles.noDataIcon} />
        <Text style={styles.noData}>Không có khách hàng nào.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách khách hàng</Text>
      <FlatList
        data={customers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  customerDetail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 5,
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  errorIcon: {
    marginBottom: 10,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6c757d',
  },
  noDataIcon: {
    marginBottom: 10,
  },
});

export default CustomersScreen;
