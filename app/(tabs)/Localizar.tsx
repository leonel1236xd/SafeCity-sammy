import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { Dimensions, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview'; // <--- USAMOS ESTO AHORA
import HamburgerMenu from '../auth/MenuHamburguesa';

const { width, height } = Dimensions.get('window');

// --- TUS DATOS DE COMISARÍAS (INTACTOS) ---
interface PoliceStation {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  jurisdictionColor: string;
  jurisdictionArea: { latitude: number; longitude: number }[];
}

const policeStations: PoliceStation[] = [
  {
    id: 1,
    latitude: -17.38977,
    longitude: -66.20358,
    name: 'EPI Nro 1: COÑA COÑA',
    jurisdictionColor: '#FF5733',
    jurisdictionArea: [
      { latitude: -17.370, longitude: -66.220 },
      { latitude: -17.370, longitude: -66.180 },
      { latitude: -17.390, longitude: -66.180 },
      { latitude: -17.410, longitude: -66.190 },
      { latitude: -17.410, longitude: -66.220 },
      { latitude: -17.395, longitude: -66.225 },
      { latitude: -17.380, longitude: -66.225 } 
    ],
  },
  {
    id: 2,
    latitude: -17.36201,
    longitude: -66.17274,
    name: 'EPI Nro 2: NORTE',
    jurisdictionColor: '#33FF57',
    jurisdictionArea: [
      { latitude: -17.340, longitude: -66.190 },
      { latitude: -17.340, longitude: -66.155 },
      { latitude: -17.360, longitude: -66.145 },
      { latitude: -17.375, longitude: -66.155 },
      { latitude: -17.375, longitude: -66.170 },
      { latitude: -17.370, longitude: -66.180 },
      { latitude: -17.365, longitude: -66.185 },
      { latitude: -17.350, longitude: -66.190 }
    ],
  },
  {
    id: 3,
    latitude: -17.42703,
    longitude: -66.16177,
    name: 'EPI Nro 3: JAIHUAYCO',
    jurisdictionColor: '#3388FF',
    jurisdictionArea: [
      { latitude: -17.410, longitude: -66.180 },
      { latitude: -17.410, longitude: -66.145 },
      { latitude: -17.430, longitude: -66.135 },
      { latitude: -17.445, longitude: -66.145 },
      { latitude: -17.445, longitude: -66.175 },
      { latitude: -17.430, longitude: -66.185 },
      { latitude: -17.420, longitude: -66.185 } 
    ],
  },
  {
    id: 4,
    latitude: -17.44445,
    longitude: -66.16550,
    name: 'EPI Nro 4: SUR',
    jurisdictionColor: '#FF33F5',
    jurisdictionArea: [
      { latitude: -17.445, longitude: -66.175 },
      { latitude: -17.445, longitude: -66.145 },
      { latitude: -17.460, longitude: -66.135 },
      { latitude: -17.475, longitude: -66.145 },
      { latitude: -17.475, longitude: -66.185 },
      { latitude: -17.465, longitude: -66.190 },
      { latitude: -17.455, longitude: -66.185 } 
    ],
  },
  {
    id: 5,
    latitude: -17.41840,
    longitude: -66.13651,
    name: 'EPI Nro 5: ALALAY',
    jurisdictionColor: '#F5FF33',
    jurisdictionArea: [
      { latitude: -17.410, longitude: -66.130 },
      { latitude: -17.395, longitude: -66.120 },
      { latitude: -17.395, longitude: -66.110 },
      { latitude: -17.415, longitude: -66.100 },
      { latitude: -17.435, longitude: -66.110 },
      { latitude: -17.450, longitude: -66.120 },
      { latitude: -17.460, longitude: -66.135 },
      { latitude: -17.445, longitude: -66.145 },
      { latitude: -17.430, longitude: -66.135 },
      { latitude: -17.420, longitude: -66.140 },
      { latitude: -17.415, longitude: -66.145 },
      { latitude: -17.410, longitude: -66.145 } 
    ],
  },
  {
   id: 6,
    latitude: -17.40112,
    longitude: -66.15737,
    name: 'EPI Nro 6: CENTRAL',
    jurisdictionColor: '#33FFF5',
    jurisdictionArea: [
      { latitude: -17.375, longitude: -66.170 },
      { latitude: -17.375, longitude: -66.130 },
      { latitude: -17.395, longitude: -66.120 },
      { latitude: -17.410, longitude: -66.130 },
      { latitude: -17.410, longitude: -66.145 },
      { latitude: -17.410, longitude: -66.180 },
      { latitude: -17.390, longitude: -66.180 },
      { latitude: -17.370, longitude: -66.180 } 
    ]
  }
];

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [showDenunciaModal, setShowDenunciaModal] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);
  const webViewRef = useRef<WebView>(null); // Referencia para controlar el mapa web
  const router = useRouter();

  // --- HTML DEL MAPA (LEAFLET) ---
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .leaflet-popup-content-wrapper { border-radius: 8px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Inicializar mapa en Cochabamba
          var map = L.map('map', {zoomControl: false}).setView([-17.3924636, -66.1582445], 13);
          
          // Cargar Tiles de OpenStreetMap (Gratis, sin API Key)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Datos desde React Native
          var stations = ${JSON.stringify(policeStations)};

          // Agregar Polígonos y Marcadores
          stations.forEach(function(station) {
            // Polígono
            var latlngs = station.jurisdictionArea.map(function(p) { return [p.latitude, p.longitude]; });
            var polygon = L.polygon(latlngs, {
              color: station.jurisdictionColor,
              fillColor: station.jurisdictionColor,
              fillOpacity: 0.3,
              weight: 2
            }).addTo(map);

            // Click en polígono
            polygon.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({type: 'stationPress', id: station.id}));
            });

            // Marcador
            var marker = L.marker([station.latitude, station.longitude]).addTo(map);
            marker.bindPopup("<b>" + station.name + "</b><br>Toca el área para ver más.");
            
            // Click en marcador
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({type: 'stationPress', id: station.id}));
            });
          });

          // Función para moverse (Llamada desde React Native)
          function flyToStation(lat, lng) {
            map.setView([lat, lng], 16);
          }
        </script>
      </body>
    </html>
  `;

  // --- LÓGICA DE LA APP ---

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(text.length > 0);
  };

  const handleStationSelect = (station: PoliceStation) => {
    setSelectedStation(station);
    setSearchQuery(station.name);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
    
    // Mover el mapa Web usando inyección de JS
    webViewRef.current?.injectJavaScript(`flyToStation(${station.latitude}, ${station.longitude}); true;`);
  };

  const handleStationPress = (stationId: number) => {
    const station = policeStations.find(s => s.id === stationId);
    if (station) {
      setSelectedStation(station);
      setShowDenunciaModal(true);
    }
  };

  const handleRealizarDenuncia = () => {
    setShowDenunciaModal(false);
    router.push('/Reportar');
  };

  // Escuchar mensajes desde el Mapa Web (Clicks en marcadores/poligonos)
  const onWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'stationPress') {
        handleStationPress(data.id);
      }
    } catch (e) {
      console.error("Error parsing message from map", e);
    }
  };

  const filteredStations = policeStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: "Cochabamba",
          headerStyle: { backgroundColor: '#2e5929' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: ()=> <HamburgerMenu/>
        }}
      />

      {/* MAPA WEB (Leaflet) */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        style={styles.map}
        onMessage={onWebViewMessage} // Recibir eventos del mapa
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator style={styles.loading} size="large" color="#2e5929" />}
      />

      {/* UI DE BÚSQUEDA (Superpuesta) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Buscar comisaría..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#0077b6" />
          </TouchableOpacity>
        </View>

        {showSuggestions && filteredStations.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={filteredStations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.suggestionItem} 
                  onPress={() => handleStationSelect(item)}
                >
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* MODAL DE DENUNCIA (Igual que antes) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDenunciaModal}
        onRequestClose={() => setShowDenunciaModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons 
                name="shield-checkmark" 
                size={50} 
                color={selectedStation?.jurisdictionColor || '#2e5929'} 
              />
            </View>
            <Text style={styles.modalTitle}>{selectedStation?.name}</Text>
            <Text style={styles.modalDescription}>¿Desea realizar una denuncia en esta estación policial?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowDenunciaModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleRealizarDenuncia}
              >
                <Text style={styles.modalButtonTextPrimary}>Realizar Denuncia</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LEYENDA (Igual que antes) */}
      <View style={styles.legendContainer}>
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Jurisdicciones:</Text>
          <FlatList
            data={policeStations}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.jurisdictionColor }]} />
                <Text style={styles.legendText} numberOfLines={1}>
                  {item.name.split(':')[1]?.trim() || item.name}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1, width: width, height: height },
  loading: { position: 'absolute', top: '50%', left: '45%' },
  // ... TUS ESTILOS DE BÚSQUEDA Y MODALES SE MANTIENEN IGUAL ...
  searchContainer: { position: 'absolute', top: 30, left: 20, right: 20, zIndex: 99 },
  searchBar: { backgroundColor: '#ffffff', borderRadius: 30, flexDirection: 'row', paddingHorizontal: 10, elevation: 5 },
  searchInput: { flex: 1, height: 40, borderRadius: 30, paddingLeft: 10, fontSize: 16, color: '#333' },
  searchButton: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, height: 40 },
  suggestionsContainer: { backgroundColor: '#ffffff', borderRadius: 10, marginTop: 5, maxHeight: 200, elevation: 5 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  suggestionText: { fontSize: 14, color: '#333' },
  legendContainer: { position: 'absolute', bottom: 70, left: 20, right: 20, zIndex: 1 },
  legend: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, padding: 12, elevation: 5 },
  legendTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 8, color: '#2e5929', textAlign: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4, marginHorizontal: 6, width: '45%' },
  legendColor: { width: 16, height: 16, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  legendText: { fontSize: 12, flex: 1 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
  modalHeader: { marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, color: '#2e5929' },
  modalDescription: { fontSize: 16, textAlign: 'center', marginBottom: 25, color: '#666' },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 10 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  modalButtonPrimary: { backgroundColor: '#006400', borderColor: '#2D5016' },
  modalButtonSecondary: { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' },
  modalButtonTextPrimary: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalButtonTextSecondary: { color: '#4A4A4A', fontSize: 16, fontWeight: '500' },
});