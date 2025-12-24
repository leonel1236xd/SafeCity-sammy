import { Tabs } from 'expo-router';
import { FontAwesome, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const Colors = {
    light: {
      tint: '#2e5929',
      headerBg: '#1a3b1a', 
      headerTint: 'white',
    },
    dark: {
      tint: 'black',
      headerBg: '#2E4A28', 
      headerTint: 'white',
    },
  };

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.tint,
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#2E4A28',
          height: 63,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: currentColors.headerBg,
          height: 100,
        },
        headerTitleStyle: {
          color: currentColors.headerTint,
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerTintColor: currentColors.headerTint,
      }}
    >
      {/* 1. Pestaña de INICIO (Listado de Policías) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gestionar Policías',
          tabBarLabel: 'Listado',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="people-roof" size={24} color={color} />
          ),
        }}
      />

      {/* 2. Pestaña de REGISTRAR (Crear Policía) */}
      <Tabs.Screen
        name="registroPolicia"
        options={{
          title: 'Registrar Policía',
          tabBarLabel: 'Registrar',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-add" size={28} color={color} />
          ),
        }}
      />

    <Tabs.Screen
        name="perfilAdmin"
        options={{
          title: 'Mi Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-circle" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="editarPolicia"
        options={{
          href: null, 
          title: 'Editar Información',
          tabBarStyle: { display: 'none' }, // Oculta el navbar de abajo
          headerShown: false, // <--- ¡AGREGA ESTA LÍNEA! Esto quita el header nativo que choca
        }}
      />
    </Tabs>
  );
}