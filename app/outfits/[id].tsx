import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { Radius, Spacing, getStatusTheme } from '@/constants/theme';
import {
  addOutfitItem,
  deleteOutfit,
  getAllClothes,
  getOutfitWithAvailability,
  removeOutfitItem,
  updateOutfitName,
} from '@/db/queries';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, scheme } = useAppTheme();
  const [outfit, setOutfit] = useState<any>(null);
  const [allClothes, setAllClothes] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const numId = Number(Array.isArray(id) ? id[0] : id);

  const loadData = useCallback(() => {
    const data = getOutfitWithAvailability(numId);
    setOutfit(data);
    if (data) setEditName(data.name);
    setAllClothes(getAllClothes() as any[]);
  }, [numId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!outfit) {
    return (
      <Screen title="Outfit">
        <View style={styles.center}>
          <Text style={{ color: colors.textMuted }}>Laden...</Text>
        </View>
      </Screen>
    );
  }

  const outfitItemIds = new Set(outfit.items.map((i: any) => i.id));
  const availableToAdd = allClothes
    .filter((c) => !outfitItemIds.has(c.id))
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.brand?.toLowerCase().includes(q) ||
        c.color?.toLowerCase().includes(q)
      );
    });

  function handleAddItem(clothesId: number) {
    addOutfitItem(numId, clothesId);
    loadData();
  }

  function handleRemoveItem(clothesId: number) {
    removeOutfitItem(numId, clothesId);
    loadData();
  }

  function handleSaveName() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== outfit.name) {
      updateOutfitName(numId, trimmed);
      loadData();
    }
    setIsEditing(false);
  }

  function handleDeleteOutfit() {
    Alert.alert('Outfit löschen', `„${outfit.name}" wirklich löschen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          deleteOutfit(numId);
          router.back();
        },
      },
    ]);
  }

  const availableCount = outfit.items.filter((i: any) => i.wash_status === 'verfügbar').length;

  return (
    <Screen
      title=""
      headerLeft={
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginLeft: -4 }}>
          <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '500' }}>Zurück</Text>
        </TouchableOpacity>
      }
      headerRight={
        <TouchableOpacity onPress={handleDeleteOutfit} style={{ padding: 4, marginRight: -4 }}>
          <Text style={{ color: colors.danger, fontSize: 15, fontWeight: '600' }}>Löschen</Text>
        </TouchableOpacity>
      }
    >
      <FlatList
        data={isAdding ? availableToAdd : outfit.items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Outfit name */}
            {isEditing ? (
              <View style={[styles.editNameCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.editNameInput, { color: colors.text, borderColor: colors.border }]}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                  onBlur={handleSaveName}
                />
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={[styles.outfitName, { color: colors.text }]}>{outfit.name}</Text>
                <Text style={[styles.tapToEdit, { color: colors.textMuted }]}>Tippe zum Umbenennen</Text>
              </TouchableOpacity>
            )}

            {/* Availability summary */}
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: outfit.allAvailable ? '#E6F2EC' : '#FCEEEA',
                  borderColor: outfit.allAvailable ? '#C8E0D5' : '#F5D5CF',
                },
              ]}
            >
              <Text style={styles.statusEmoji}>
                {outfit.allAvailable ? '✓' : '!'}
              </Text>
              <View style={styles.statusInfo}>
                <Text
                  style={[
                    styles.statusTitle,
                    { color: outfit.allAvailable ? '#2D6A4F' : '#9B3B2A' },
                  ]}
                >
                  {outfit.allAvailable ? 'Alles verfügbar' : 'Nicht vollständig'}
                </Text>
                <Text
                  style={[
                    styles.statusSubtitle,
                    { color: outfit.allAvailable ? '#4A9E70' : '#C45C4A' },
                  ]}
                >
                  {outfit.itemCount === 0
                    ? 'Noch keine Teile hinzugefügt'
                    : `${availableCount} von ${outfit.itemCount} Teilen verfügbar`}
                </Text>
              </View>
            </View>

            {/* Section toggle */}
            <View style={styles.sectionToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isAdding && { backgroundColor: colors.accent },
                  isAdding && { backgroundColor: colors.surfaceMuted },
                ]}
                onPress={() => { setIsAdding(false); setSearchQuery(''); }}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: !isAdding ? colors.accentText : colors.textSecondary },
                  ]}
                >
                  Im Outfit ({outfit.itemCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isAdding && { backgroundColor: colors.accent },
                  !isAdding && { backgroundColor: colors.surfaceMuted },
                ]}
                onPress={() => setIsAdding(true)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: isAdding ? colors.accentText : colors.textSecondary },
                  ]}
                >
                  + Hinzufügen
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search bar for adding mode */}
            {isAdding && (
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.surfaceMuted,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Suche nach Name, Kategorie, Farbe..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            )}
          </View>
        }
        renderItem={({ item }) => {
          const status = getStatusTheme(item.wash_status, scheme);

          return (
            <TouchableOpacity
              style={[
                styles.itemRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() =>
                isAdding ? handleAddItem(item.id) : handleRemoveItem(item.id)
              }
              activeOpacity={0.85}
            >
              {item.photo_uri ? (
                <Image source={{ uri: item.photo_uri }} style={styles.itemPhoto} />
              ) : (
                <View style={[styles.itemPhotoPlaceholder, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>
                    {item.name?.charAt(0) ?? '?'}
                  </Text>
                </View>
              )}

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.category}
                  {item.color ? ` · ${item.color}` : ''}
                </Text>
              </View>

              {!isAdding && (
                <View style={[styles.itemBadge, { backgroundColor: status.background }]}>
                  <Text style={[styles.itemBadgeText, { color: status.color }]}>{status.label}</Text>
                </View>
              )}

              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: isAdding ? colors.accentSoft : colors.dangerSoft ?? '#FCEEEA',
                  },
                ]}
              >
                <Text
                  style={{
                    color: isAdding ? colors.accent : colors.danger,
                    fontSize: 16,
                    fontWeight: '700',
                  }}
                >
                  {isAdding ? '+' : '−'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={[styles.emptyList, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {isAdding
                ? 'Keine weiteren Kleidungsstücke verfügbar'
                : 'Noch keine Teile im Outfit. Tippe auf „+ Hinzufügen" um Kleidungsstücke zuzuweisen.'}
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  headerSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  outfitName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tapToEdit: {
    fontSize: 12,
    marginTop: 2,
  },
  editNameCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  editNameInput: {
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingBottom: Spacing.xs,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statusEmoji: {
    fontSize: 28,
  },
  statusInfo: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 13,
  },
  sectionToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  itemPhoto: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    resizeMode: 'cover',
  },
  itemPhotoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
