import { useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Image, ScrollView
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getClothesByStatus, updateWashStatus } from '@/db/queries';

const STATUSES = ['im Wäschekorb', 'in der Wäsche', 'im Tumbler'] as const;
type Status = typeof STATUSES[number];

const BOX_TITLE: Record<Status, string> = {
    'im Wäschekorb': 'Wäschekorb',
    'in der Wäsche': 'Waschmaschine',
    'im Tumbler': 'Tumbler',
};
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
    box: {
        backgroundColor: '#f5f5f5',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
    },
    boxTitle: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
    boxCount: { fontSize: 12, color: '#888', marginBottom: 12 },
    empty: { fontSize: 13, color: '#bbb', textAlign: 'center', paddingVertical: 12 },
    clothItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
        gap: 10,
    },
    clothItemActive: { opacity: 0.7, backgroundColor: '#e8e8e8' },
    photo: { width: 52, height: 52, borderRadius: 8, resizeMode: 'cover' },
    photoPlaceholder: {
        width: 52, height: 52, borderRadius: 8,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center', alignItems: 'center',
    },
    photoPlaceholderText: { fontSize: 9, color: '#aaa' },
    clothInfo: { flex: 1 },
    clothName: { fontSize: 14, fontWeight: '500' },
    clothSub: { fontSize: 12, color: '#888', marginTop: 2 },
    moveButton: {
        backgroundColor: '#333',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    moveButtonText: { color: '#fff', fontSize: 12, fontWeight: '500' },
});

export default function LaundryScreen() {
    const [items, setItems] = useState<Record<Status, any[]>>({
        'im Wäschekorb': [],
        'in der Wäsche': [],
        'im Tumbler': [],
    });

    useFocusEffect(
        useCallback(() => {
            setItems({
                'im Wäschekorb': getClothesByStatus('im Wäschekorb') as any[],
                'in der Wäsche': getClothesByStatus('in der Wäsche') as any[],
                'im Tumbler': getClothesByStatus('im Tumbler') as any[],
            });
        }, [])
    );

    function handleDrop(status: Status, newData: any[], from: number, to: number) {
        setItems(prev => ({ ...prev, [status]: newData }));
    }

    function handleMoveToNext(item: any, currentStatus: Status) {
        const order: Status[] = ['im Wäschekorb', 'in der Wäsche', 'im Tumbler'];
        const currentIndex = order.indexOf(currentStatus);
        const nextStatus = currentIndex < order.length - 1
            ? order[currentIndex + 1]
            : 'verfügbar';

        updateWashStatus(item.id, nextStatus);

        if (nextStatus === 'verfügbar') {
            setItems(prev => ({
                ...prev,
                [currentStatus]: prev[currentStatus].filter(c => c.id !== item.id),
            }));
        } else {
            setItems(prev => ({
                ...prev,
                [currentStatus]: prev[currentStatus].filter(c => c.id !== item.id),
                [nextStatus]: [...prev[nextStatus], { ...item, wash_status: nextStatus }],
            }));
        }
    }

    function renderItem(status: Status) {
        return ({ item, drag, isActive }: RenderItemParams<any>) => (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    onPress={() => router.push(`/clothes/${item.id}`)}
                    style={[styles.clothItem, isActive && styles.clothItemActive]}
                >
                    {item.photo_uri ? (
                        <Image source={{ uri: item.photo_uri }} style={styles.photo} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoPlaceholderText}>kein Foto</Text>
                        </View>
                    )}
                    <View style={styles.clothInfo}>
                        <Text style={styles.clothName}>{item.name}</Text>
                        <Text style={styles.clothSub}>{item.category}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.moveButton}
                        onPress={() => handleMoveToNext(item, status)}
                    >
                        <Text style={styles.moveButtonText}>
                            {status === 'im Tumbler' ? 'Fertig' : 'Weiter'}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Wäsche</Text>

                {STATUSES.map(status => (
                    <View key={status} style={styles.box}>
                        <Text style={styles.boxTitle}>{BOX_TITLE[status]}</Text>
                        <Text style={styles.boxCount}>{items[status].length} Stück</Text>

                        {items[status].length === 0 ? (
                            <Text style={styles.empty}>Leer</Text>
                        ) : (
                            <DraggableFlatList
                                data={items[status]}
                                keyExtractor={item => item.id.toString()}
                                renderItem={renderItem(status)}
                                onDragEnd={({ data, from, to }) => handleDrop(status, data, from, to)}
                            />
                        )}
                    </View>
                ))}
            </View>
        </GestureHandlerRootView>
    );
}
