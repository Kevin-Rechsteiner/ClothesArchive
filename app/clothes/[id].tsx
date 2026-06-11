import { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, Alert, Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getClothesById, updateClothesPhoto, updateWashStatus, deleteClothes } from '@/db/queries';

export default function ClothesDetailScreen() {
    const { id } = useLocalSearchParams();
    const [item, setItem] = useState<any>(null);
    const [washStatus, setWashStatus] = useState<string>('verfügbar');

    useEffect(() => {
        const numId = Number(Array.isArray(id) ? id[0] : id);
        const result = getClothesById(numId) as any;
        if (result) {
            setItem(result);
            setWashStatus(result.wash_status ?? 'verfügbar');
        }
    }, [id]);

    async function handlePhoto() {
        Alert.alert('Foto', 'Woher möchtest du das Foto nehmen?', [
            {
                text: 'Kamera',
                onPress: async () => {
                    const permission = await ImagePicker.requestCameraPermissionsAsync();
                    if (!permission.granted) return;
                    const result = await ImagePicker.launchCameraAsync({
                        allowsEditing: true, aspect: [4, 3], quality: 0.8,
                    });
                    if (!result.canceled) savePhoto(result.assets[0].uri);
                },
            },
            {
                text: 'Galerie',
                onPress: async () => {
                    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permission.granted) return;
                    const result = await ImagePicker.launchImageLibraryAsync({
                        allowsEditing: true, aspect: [4, 3], quality: 0.8,
                    });
                    if (!result.canceled) savePhoto(result.assets[0].uri);
                },
            },
            { text: 'Abbrechen', style: 'cancel' },
        ]);
    }

    function savePhoto(uri: string) {
        updateClothesPhoto(Number(id), uri);
        setItem((prev: any) => ({ ...prev, photo_uri: uri }));
    }

    function handleWashToggle() {
        const newStatus = washStatus === 'verfügbar' ? 'im Wäschekorb' : 'verfügbar';
        updateWashStatus(Number(id), newStatus);
        setWashStatus(newStatus);
        setItem((prev: any) => ({ ...prev, wash_status: newStatus }));
    }

    function handleDelete() {
        Alert.alert('Löschen', `"${item?.name}" wirklich löschen?`, [
            { text: 'Abbrechen', style: 'cancel' },
            {
                text: 'Löschen', style: 'destructive', onPress: () => {
                    deleteClothes(Number(id));
                    router.back();
                },
            },
        ]);
    }

    if (!item) return (
        <View style={styles.container}>
            <Text style={{ padding: 20 }}>Laden...</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={handlePhoto}>
                {item.photo_uri ? (
                    <Image source={{ uri: item.photo_uri }} style={styles.photo} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderText}>Foto hinzufügen</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
                <Text style={styles.name}>{item.name}</Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{washStatus}</Text>
                </View>

                {[
                    { label: 'Kategorie', value: item.category },
                    { label: 'Farbe', value: item.color },
                    { label: 'Marke', value: item.brand },
                    { label: 'Material', value: item.material },
                    { label: 'Waschanweisung', value: item.wash_instruction },
                ].map(({ label, value }) =>
                    value ? (
                        <View key={label} style={styles.row}>
                            <Text style={styles.rowLabel}>{label}</Text>
                            <Text style={styles.rowValue}>{value}</Text>
                        </View>
                    ) : null
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, washStatus === 'in der Wäsche' && styles.buttonGreen]}
                onPress={handleWashToggle}
            >
                <Text style={styles.buttonText}>
                    {washStatus === 'verfügbar' ? 'In den Wäschekorb' : 'Als verfügbar markieren'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.buttonOutline}
                onPress={() => router.push(`/clothes/edit/${id}`)}
            >
                <Text style={styles.buttonOutlineText}>Bearbeiten</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonDanger} onPress={handleDelete}>
                <Text style={styles.buttonText}>Löschen</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    photo: { width: '100%', height: 280, resizeMode: 'cover' },
    photoPlaceholder: {
        width: '100%', height: 280, backgroundColor: '#f2f2f2',
        justifyContent: 'center', alignItems: 'center',
    },
    photoPlaceholderText: { fontSize: 18, color: '#aaa' },
    infoBox: { padding: 20 },
    name: { fontSize: 26, fontWeight: '600', marginBottom: 8 },
    badge: {
        alignSelf: 'flex-start', backgroundColor: '#e8e8e8',
        paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 20, marginBottom: 16,
    },
    badgeText: { fontSize: 13, color: '#555' },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    rowLabel: { fontSize: 14, color: '#888' },
    rowValue: { fontSize: 14, color: 'white', fontWeight: '500' },
    button: {
        backgroundColor: '#333', margin: 20, marginBottom: 8,
        padding: 16, borderRadius: 10, alignItems: 'center',
    },
    buttonGreen: { backgroundColor: '#2d7a4f' },
    buttonOutline: {
        margin: 20, marginTop: 0, marginBottom: 8,
        padding: 16, borderRadius: 10, alignItems: 'center',
        borderWidth: 1, borderColor: '#333',
    },
    buttonOutlineText: { fontSize: 15, color: '#333', fontWeight: '500' },
    buttonDanger: {
        backgroundColor: '#c0392b', margin: 20, marginTop: 0,
        padding: 16, borderRadius: 10, alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: '500', fontSize: 15 },
});