import { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, Modal, FlatList
} from 'react-native';
import { router } from 'expo-router';
import { addClothes } from '@/db/queries';
import { getAllBrands, addBrand } from '@/db/queries';

const CATEGORIES = ['T-Shirt', 'Hose', 'Jacke', 'Pullover', 'Longsleeve'];
const COLORS = ['Schwarz', 'Weiss', 'Grau', 'Blau', 'Rot', 'Grün', 'Orange', 'Violett'];

function SelectModal({
                         visible, title, options, onSelect, onClose
                     }: {
    visible: boolean;
    title: string;
    options: string[];
    onSelect: (val: string) => void;
    onClose: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); onClose(); }}>
                                <Text style={styles.modalItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
                        <Text style={styles.modalCancelText}>Abbrechen</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function BrandModal({
                        visible, brands, onSelect, onClose
                    }: {
    visible: boolean;
    brands: string[];
    onSelect: (val: string) => void;
    onClose: () => void;
}) {
    const [search, setSearch] = useState('');
    const filtered = brands.filter(b => b.toLowerCase().includes(search.toLowerCase()));

    function handleAdd() {
        if (search.trim() && !brands.includes(search.trim())) {
            addBrand(search.trim());
            onSelect(search.trim());
            onClose();
        } else if (search.trim()) {
            onSelect(search.trim());
            onClose();
        }
    }

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Marke wählen</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Suchen oder neue Marke eingeben..."
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.trim() !== '' && !filtered.find(b => b.toLowerCase() === search.toLowerCase()) && (
                        <TouchableOpacity style={styles.addNewButton} onPress={handleAdd}>
                            <Text style={styles.addNewText}>+ "{search.trim()}" hinzufügen</Text>
                        </TouchableOpacity>
                    )}
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); onClose(); }}>
                                <Text style={styles.modalItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
                        <Text style={styles.modalCancelText}>Abbrechen</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

export default function AddClothesScreen() {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [material, setMaterial] = useState('');
    const [washInstruction, setWashInstruction] = useState('');
    const [color, setColor] = useState('');
    const [brand, setBrand] = useState('');
    const [brands, setBrands] = useState<string[]>([]);

    const [showCategory, setShowCategory] = useState(false);
    const [showColor, setShowColor] = useState(false);
    const [showBrand, setShowBrand] = useState(false);

    useEffect(() => {
        const result = getAllBrands() as any[];
        setBrands(result.map(b => b.name));
    }, []);

    function handleSave() {
        if (!name.trim()) return;
        addClothes(name, category, material, washInstruction, color, brand, '');
        router.back();
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Neues Kleidungsstück</Text>

            <View style={styles.field}>
                <Text style={styles.label}>Name *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="z.B. Blaues Shirt" />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Kategorie</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowCategory(true)}>
                    <Text style={category ? styles.selectorText : styles.selectorPlaceholder}>
                        {category || 'Kategorie wählen...'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Farbe</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowColor(true)}>
                    <Text style={color ? styles.selectorText : styles.selectorPlaceholder}>
                        {color || 'Farbe wählen...'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Marke</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowBrand(true)}>
                    <Text style={brand ? styles.selectorText : styles.selectorPlaceholder}>
                        {brand || 'Marke wählen oder eingeben...'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Material</Text>
                <TextInput style={styles.input} value={material} onChangeText={setMaterial} placeholder="z.B. 100% Baumwolle" />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Waschanweisung</Text>
                <TextInput style={styles.input} value={washInstruction} onChangeText={setWashInstruction} placeholder="z.B. 30°C Schonwäsche" />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Speichern</Text>
            </TouchableOpacity>

            <SelectModal
                visible={showCategory}
                title="Kategorie wählen"
                options={CATEGORIES}
                onSelect={setCategory}
                onClose={() => setShowCategory(false)}
            />
            <SelectModal
                visible={showColor}
                title="Farbe wählen"
                options={COLORS}
                onSelect={setColor}
                onClose={() => setShowColor(false)}
            />
            <BrandModal
                visible={showBrand}
                brands={brands}
                onSelect={(val) => { setBrand(val); setBrands(getAllBrands().map((b: any) => b.name)); }}
                onClose={() => setShowBrand(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: '600', marginBottom: 24, color: 'white' },
    field: { marginBottom: 16 },
    label: { fontSize: 13, color: 'white', marginBottom: 4 },
    input: {
        borderWidth: 1, borderColor: '#ddd',
        borderRadius: 8, padding: 12, fontSize: 15, color: 'white',
    },
    selector: {
        borderWidth: 1, borderColor: '#ddd',
        borderRadius: 8, padding: 12, color: 'white',
    },
    selectorText: { fontSize: 15, color: 'white' },
    selectorPlaceholder: { fontSize: 15, color: '#aaa' },
    button: {
        backgroundColor: '#333', padding: 16,
        borderRadius: 10, alignItems: 'center',
        marginTop: 8, marginBottom: 40,
    },
    buttonText: { color: '#fff', fontWeight: '500' },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalBox: {
        backgroundColor: '#fff', borderTopLeftRadius: 16,
        borderTopRightRadius: 16, padding: 20, maxHeight: '70%',
    },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalItemText: { fontSize: 16 },
    modalCancel: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    modalCancelText: { fontSize: 16, color: '#888' },
    addNewButton: {
        backgroundColor: '#f0f0f0', padding: 12,
        borderRadius: 8, marginBottom: 8,
    },
    addNewText: { fontSize: 15, color: '#333' },
});