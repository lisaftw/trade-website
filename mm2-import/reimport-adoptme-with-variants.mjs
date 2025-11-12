import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';

const supabaseUrl = 'https://eqoyszybgxowrgmaotwiurlki.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxb3lzenlsZ3hvd3JnbWFvdHdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTcxNzMxNiwiZXhwIjoyMDQ3MjkzMzE2fQ.m9aIc2CtOd1QVVpvQhNxe3VdRwsKLdKdRwsKLdKdRwsKLdKd';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Reading adm.xlsx file...');
const workbook = XLSX.readFile('adm.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Found ${data.length} items to update with variant values`);

if (data.length > 0) {
  console.log('Excel columns found:', Object.keys(data[0]));
  console.log('First row sample:', data[0]);
}

for (const row of data) {
  const itemName = row['PetName'];
  const imageUrl = `https://assetdelivery.roblox.com/v1/asset/?id=${row['ImageURL']}`;
  
  // Map all variant values from Excel columns
  const itemData = {
    game: 'Adopt Me',
    name: itemName,
    section: row['Rarity'] || 'Pets',
    image_url: imageUrl,
    rarity: row['Rarity'],
    demand: row['Demand'],
    rap_value: parseFloat(row['Base']) || 0,
    value_f: parseFloat(row['F']) || 0,
    value_r: parseFloat(row['R']) || 0,
    value_h: parseFloat(row['H']) || 0,
    value_fr: parseFloat(row['FR']) || 0,
    value_n: parseFloat(row['N']) || 0,
    value_nr: parseFloat(row['NR']) || 0,
    value_np: parseFloat(row['NP']) || 0,
    value_nfr: parseFloat(row['NFR']) || 0,
    value_m: parseFloat(row['M']) || 0,
    value_mr: parseFloat(row['MR']) || 0,
    value_mf: parseFloat(row['MF']) || 0,
    value_mfr: parseFloat(row['MFR']) || 0,
    rating: 0,
    change_percent: 0,
    exist_count: 0
  };

  // Try to update existing item first
  const { data: existing } = await supabase
    .from('items')
    .select('id')
    .eq('game', 'Adopt Me')
    .eq('name', itemName)
    .single();

  if (existing) {
    // Update existing item with variant values
    const { error } = await supabase
      .from('items')
      .update(itemData)
      .eq('id', existing.id);

    if (error) {
      console.error(`Failed to update ${itemName}:`, error.message);
    } else {
      console.log(`Updated: ${itemName} with all variant values`);
    }
  } else {
    // Insert new item
    const { error } = await supabase.from('items').insert(itemData);

    if (error) {
      console.error(`Failed to insert ${itemName}:`, error.message);
    } else {
      console.log(`Inserted: ${itemName} with all variant values`);
    }
  }
}

console.log('Import/Update complete!');
