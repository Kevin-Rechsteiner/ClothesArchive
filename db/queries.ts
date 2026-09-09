import db from './database';

export function getAllClothes() {
    return db.getAllSync('SELECT * FROM clothes ORDER BY created_at DESC');
}

export function addClothes(
    name: string,
    category: string,
    material: string,
    wash_instruction: string,
    color: string,
    brand: string,
    photo_uri: string
) {
    db.runSync(
        `INSERT INTO clothes (name, category, material, wash_instruction, color, brand, photo_uri)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, category, material, wash_instruction, color, brand, photo_uri]
    );

}

export function updateWashStatus(id: number, status: string) {
    db.runSync('UPDATE clothes SET wash_status = ? WHERE id = ?', [status, id]);
}

export function updateWashStatusBulk(fromStatus: string, toStatus: string) {
    db.runSync('UPDATE clothes SET wash_status = ? WHERE wash_status = ?', [toStatus, fromStatus]);
}

export function deleteClothes(id: number) {
    db.runSync('DELETE FROM clothes WHERE id = ?', [id]);
}

export function updateWashStatusForMultiple(ids: number[], status: string) {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    db.runSync(`UPDATE clothes SET wash_status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
}

export function deleteClothesMultiple(ids: number[]) {
    if (ids.length === 0) return;
    // We should also delete from outfit_items if they are part of any outfit
    const placeholders = ids.map(() => '?').join(',');
    db.runSync(`DELETE FROM outfit_items WHERE clothes_id IN (${placeholders})`, ids);
    db.runSync(`DELETE FROM clothes WHERE id IN (${placeholders})`, ids);
}

export function getAllBrands() {
    return db.getAllSync('SELECT * FROM brands ORDER BY name ASC');
}

export function addBrand(name: string) {
    db.runSync('INSERT OR IGNORE INTO brands (name) VALUES (?)', [name]);
}

export function getClothesById(id: number) {
    return db.getFirstSync('SELECT * FROM clothes WHERE id = ?', [id]);
}

export function updateClothesPhoto(id: number, photo_uri: string) {
    db.runSync('UPDATE clothes SET photo_uri = ? WHERE id = ?', [photo_uri, id]);
}
export function getClothesById_test(id: number) {
    console.log('Suche ID:', id);
    const all = db.getAllSync('SELECT * FROM clothes');
    console.log('Alle clothes:', JSON.stringify(all));
    const result = db.getFirstSync('SELECT * FROM clothes WHERE id = ?', [id]);
    console.log('Gefunden:', JSON.stringify(result));
    return result;
}

export function updateClothes(
    id: number,
    name: string,
    category: string,
    material: string,
    wash_instruction: string,
    color: string,
    brand: string
) {
    db.runSync(
        `UPDATE clothes SET name = ?, category = ?, material = ?, wash_instruction = ?, color = ?, brand = ? WHERE id = ?`,
        [name, category, material, wash_instruction, color, brand, id]
    );
}
export function getClothesByStatus(status: string) {
    return db.getAllSync('SELECT * FROM clothes WHERE wash_status = ?', [status]);
}

// ─── Outfit queries ───

export function createOutfit(name: string): number {
    const result = db.runSync('INSERT INTO outfits (name) VALUES (?)', [name]);
    return result.lastInsertRowId;
}

export function deleteOutfit(id: number) {
    db.runSync('DELETE FROM outfit_items WHERE outfit_id = ?', [id]);
    db.runSync('DELETE FROM outfits WHERE id = ?', [id]);
}

export function addOutfitItem(outfitId: number, clothesId: number) {
    db.runSync(
        'INSERT INTO outfit_items (outfit_id, clothes_id) VALUES (?, ?)',
        [outfitId, clothesId]
    );
}

export function removeOutfitItem(outfitId: number, clothesId: number) {
    db.runSync(
        'DELETE FROM outfit_items WHERE outfit_id = ? AND clothes_id = ?',
        [outfitId, clothesId]
    );
}

export function getAllOutfits() {
    return db.getAllSync('SELECT * FROM outfits ORDER BY created_at DESC');
}

export function getOutfitItems(outfitId: number) {
    return db.getAllSync(
        `SELECT c.* FROM clothes c
         INNER JOIN outfit_items oi ON oi.clothes_id = c.id
         WHERE oi.outfit_id = ?
         ORDER BY c.name ASC`,
        [outfitId]
    );
}

export function getOutfitWithAvailability(outfitId: number) {
    const outfit = db.getFirstSync('SELECT * FROM outfits WHERE id = ?', [outfitId]) as any;
    if (!outfit) return null;
    const items = getOutfitItems(outfitId) as any[];
    const allAvailable = items.length > 0 && items.every((i) => i.wash_status === 'verfügbar');
    return { ...outfit, items, allAvailable, itemCount: items.length };
}

export function getAllOutfitsWithAvailability() {
    const outfits = getAllOutfits() as any[];
    return outfits.map((outfit) => {
        const items = getOutfitItems(outfit.id) as any[];
        const allAvailable = items.length > 0 && items.every((i) => i.wash_status === 'verfügbar');
        return { ...outfit, items, allAvailable, itemCount: items.length };
    });
}

export function updateOutfitName(id: number, name: string) {
    db.runSync('UPDATE outfits SET name = ? WHERE id = ?', [name, id]);
}
