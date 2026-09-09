import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { OutfitCard } from '@/components/OutfitCard';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { getAllOutfitsWithAvailability, createOutfit, deleteOutfit } from '@/db/queries';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function OutfitsScreen() {
  const { colors } = useAppTheme();
  const [outfits, setOutfits] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const loadOutfits = useCallback(() => {
    setOutfits(getAllOutfitsWithAvailability());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOutfits();
    }, [loadOutfits])
  );

  function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createOutfit(trimmed);
    setNewName('');
    setShowCreate(false);
    loadOutfits();
  }

  function handleDelete(id: number) {
    const outfit = outfits.find((o) => o.id === id);
    Alert.alert(
      'Outfit löschen',
      `„${outfit?.name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            deleteOutfit(id);
            loadOutfits();
          },
        },
      ]
    );
  }

  function handlePress(id: number) {
    router.push(`/outfits/${id}` as any);
  }

  const availableCount = outfits.filter((o) => o.allAvailable).length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Screen
        title="Outfits"
        subtitle={
          outfits.length === 0
            ? 'Erstelle dein erstes Outfit'
            : `${outfits.length} Outfits · ${availableCount} bereit`
        }
      >
        <View style={styles.content}>
          {outfits.length === 0 && !showCreate ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Noch keine Outfits</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Stelle Kombinationen aus deinen Kleidungsstücken zusammen und sieh auf einen Blick, ob alles verfügbar ist.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.accent }]}
                  onPress={() => setShowCreate(true)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.emptyButtonText, { color: colors.accentText }]}>
                    + Erstes Outfit erstellen
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <FlatList
              data={outfits}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <OutfitCard
                  outfit={item}
                  onPress={handlePress}
                  onDelete={handleDelete}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                showCreate ? (
                  <View style={[styles.createCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.createTitle, { color: colors.text }]}>Neues Outfit</Text>
                    <TextInput
                      style={[
                        styles.createInput,
                        {
                          backgroundColor: colors.surfaceMuted,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholder="Name (z.B. Büro, Wochenende...)"
                      placeholderTextColor={colors.textMuted}
                      value={newName}
                      onChangeText={setNewName}
                      autoFocus
                      onSubmitEditing={handleCreate}
                    />
                    <View style={styles.createActions}>
                      <TouchableOpacity
                        style={[styles.createCancel, { borderColor: colors.border }]}
                        onPress={() => {
                          setShowCreate(false);
                          setNewName('');
                        }}
                      >
                        <Text style={[styles.createCancelText, { color: colors.textSecondary }]}>
                          Abbrechen
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.createSave,
                          {
                            backgroundColor: newName.trim() ? colors.accent : colors.surfaceMuted,
                          },
                        ]}
                        onPress={handleCreate}
                        disabled={!newName.trim()}
                      >
                        <Text
                          style={[
                            styles.createSaveText,
                            { color: newName.trim() ? colors.accentText : colors.textMuted },
                          ]}
                        >
                          Erstellen
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null
              }
              ListFooterComponent={
                <View style={[styles.hintCard, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.hintText, { color: colors.textMuted }]}>
                    Swipe nach links zum Löschen · Tippe zum Bearbeiten
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* FAB */}
        {outfits.length > 0 && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.text, shadowColor: colors.shadow }]}
            onPress={() => setShowCreate(true)}
            activeOpacity={0.9}
          >
            <Text style={[styles.fabText, { color: colors.background }]}>+ Neues Outfit</Text>
          </TouchableOpacity>
        )}
      </Screen>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  createCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  createInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 15,
  },
  createActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  createCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  createCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createSave: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  createSaveText: {
    fontSize: 14,
    fontWeight: '700',
  },
  hintCard: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  fabText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
