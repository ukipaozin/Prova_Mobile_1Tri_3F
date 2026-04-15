import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, SafeAreaView,
} from 'react-native';

// iNaturalist — fotos reais de tartarugas com licença aberta
const API_URL =
  'https://api.inaturalist.org/v1/observations?taxon_name=Testudines&photos=true&per_page=30&order_by=random';

export default function App() {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [info, setInfo]         = useState(null);

  const fetchTurtle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();

      // filtra apenas observações que realmente têm foto
      const valid = data.results.filter(
        (o) => o.photos?.[0]?.url
      );
      if (!valid.length) throw new Error('Nenhuma foto encontrada');

      // pega uma observação aleatória dentre os resultados
      const pick = valid[Math.floor(Math.random() * valid.length)];

      // troca "square" por "large" para melhor qualidade
      const url = pick.photos[0].url.replace('square', 'large');

      setImageUrl(url);
      setInfo({
        species: pick.taxon?.name ?? 'Testudines',
        common:  pick.taxon?.preferred_common_name ?? 'tartaruga',
        place:   pick.place_guess ?? 'local desconhecido',
      });
    } catch (e) {
      setError('Não foi possível buscar a imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🐢 Tartaruga aleatória</Text>

      <View style={styles.imageBox}>
        {loading ? (
          <ActivityIndicator size="large" color="#3B6D11" />
        ) : imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.placeholder}>
            Pressione o botão para ver uma tartaruga 🐢
          </Text>
        )}
      </View>

      {info && (
        <View style={styles.infoBox}>
          <Text style={styles.commonName}>{info.common}</Text>
          <Text style={styles.sciName}>{info.species}</Text>
          <Text style={styles.place}>📍 {info.place}</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={fetchTurtle}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Buscando...' : 'Nova tartaruga 🐢'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F2F8ED' },
  title:          { fontSize: 24, fontWeight: '600', marginBottom: 24, color: '#173404' },
  imageBox:       { width: 300, height: 300, borderRadius: 20, backgroundColor: '#C0DD97', alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' },
  image:          { width: 300, height: 300 },
  placeholder:    { color: '#3B6D11', textAlign: 'center', paddingHorizontal: 24, fontSize: 15 },
  infoBox:        { alignItems: 'center', marginBottom: 8 },
  commonName:     { fontSize: 16, fontWeight: '600', color: '#27500A', textTransform: 'capitalize' },
  sciName:        { fontSize: 13, fontStyle: 'italic', color: '#3B6D11' },
  place:          { fontSize: 12, color: '#639922', marginTop: 2 },
  error:          { fontSize: 13, color: '#A32D2D', marginBottom: 8, textAlign: 'center' },
  button:         { backgroundColor: '#639922', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14, marginTop: 12 },
  buttonDisabled: { opacity: 0.5 },
  buttonText:     { color: '#fff', fontSize: 16, fontWeight: '600' },
});
