import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Admin Screens
import AdminServicesScreen from '../screens/admin/ServicesScreen';
import TransactionsScreen from '../screens/admin/TransactionsScreen';
import CustomersScreen from '../screens/admin/CustomersScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

// Customer Screens
import CustomerServicesScreen from '../screens/customer/ServicesScreen';
import AppointmentsScreen from '../screens/customer/AppointmentsScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ------------------- ADMIN TABS -------------------
function AdminServicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminServicesList" component={AdminServicesScreen} options={{ title: 'Dịch vụ' }} />
      <Stack.Screen name="AddService" component={AdminServicesScreen} options={{ title: 'Thêm/Sửa Dịch vụ' }} />
    </Stack.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'AdminServices') {
            iconName = focused ? 'briefcase-variant' : 'briefcase-variant-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'credit-card-check' : 'credit-card-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'AdminProfile') {
            iconName = focused ? 'account-cog' : 'account-cog-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="AdminServices" component={AdminServicesStack} options={{ title: 'Dịch vụ' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Giao dịch' }} />
      <Tab.Screen name="Customers" component={CustomersScreen} options={{ title: 'Khách hàng' }} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}

// ------------------- CUSTOMER TABS -------------------
function CustomerServicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CustomerServicesList" component={CustomerServicesScreen} options={{ title: 'Dịch vụ' }} />
    </Stack.Navigator>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'CustomerServices') {
            iconName = focused ? 'briefcase-variant' : 'briefcase-variant-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar-check' : 'calendar-outline';
          } else if (route.name === 'CustomerProfile') {
            iconName = focused ? 'account-circle' : 'account-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="CustomerServices" component={CustomerServicesStack} options={{ title: 'Dịch vụ' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Lịch hẹn' }} />
      <Tab.Screen name="CustomerProfile" component={CustomerProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}

// ------------------- AUTH STACK -------------------
function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Quên mật khẩu' }} />
    </Stack.Navigator>
  );
}

// ------------------- MAIN APP NAVIGATION -------------------
const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          const adminDoc = await firestore().collection('admins').doc(authUser.uid).get();
          setIsAdmin(adminDoc.exists);
        } catch (err) {
          console.error('Lỗi kiểm tra admin:', err);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Đang kiểm tra tài khoản...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          isAdmin ? (
            <Stack.Screen name="Admin" component={AdminTabs} />
          ) : (
            <Stack.Screen name="Customer" component={CustomerTabs} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
