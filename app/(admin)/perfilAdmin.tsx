import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export default function PerfilAdmin() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<{ correo: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar datos del Admin almacenados en el celular
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsed = JSON.parse(data);
          setAdminData(parsed);
        }
      } catch (error) {
        console.error('Error al cargar datos del admin', error);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Borramos los datos de sesión
      await AsyncStorage.removeItem('userData');
      // Redirigimos al Login y borramos el historial de navegación
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6f4" />
      
      <View style={styles.content}>
        {/* Ícono Grande */}
        <View style={styles.iconContainer}>
          <FontAwesome5 name="user-tie" size={80} color="#2e5929" />
        </View>

        {/* Textos de Información */}
        <Text style={styles.roleText}>ADMINISTRADOR</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Correo Electrónico:</Text>
          <Text style={styles.emailText}>
            {adminData?.correo || 'Cargando...'}
          </Text>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="logout" size={24} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f4',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    width: 150,
    height: 150,
    backgroundColor: 'white',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  roleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e5929',
    marginBottom: 30,
    letterSpacing: 1,
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545', // Rojo para acción de salida
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});