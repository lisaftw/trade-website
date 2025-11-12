import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Reading adm.xlsx file...');
const workbook = XLSX.readFile('adm.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Found ${data.length} items to import with variant values`);

for (const row of data) {
  const item = {
    game: 'Adopt Me',
    name: row['PetName'],
    image_url: row['ImageURL'], // Direct CDN URL from Excel
    section: row['Rarity'] || 'Common',
    rarity: row['Rarity'] || 'Common',
    demand: row['Demand'] || 'N/A',
    rap_value: parseFloat(row['Base']) || 0,
    value_f: parseFloat(row['F']) || 0,
    value_r: parseFloat(row['R']) || 0,
    value_n: parseFloat(row['N']) || 0,
    value_fr: parseFloat(row['FR']) || 0,
    value_h: parseFloat(row['H']) || 0,
    value_nfr: parseFloat(row['NFR']) || 0,
    value_np: parseFloat(row['NP']) || 0,
    value_nr: parseFloat(row['NR']) || 0,
    value_m: parseFloat(row['M']) || 0,
    value_mr: parseFloat(row['MR']) || 0,
    value_mf: parseFloat(row['MF']) || 0,
    value_mfr: parseFloat(row['MFR']) || 0,
    rating: 0,
    change_percent: 0,
    exist_count: 0,
  };

  const { error } = await supabase.from('items').insert(item);

  if (error) {
    console.error(`Failed to import ${item.name}:`, error.message);
  } else {
    console.log(`Imported: ${item.name}`);
  }
}

console.log('Import complete!');
