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

export function deleteClothes(id: number) {
    db.runSync('DELETE FROM clothes WHERE id = ?', [id]);
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
