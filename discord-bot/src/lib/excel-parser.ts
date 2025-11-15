import * as XLSX from 'xlsx'

export interface ExcelItemUpdate {
  name: string
  rap_value?: number
  value_fr?: number
  value_f?: number
  value_r?: number
  value_n?: number
  value_nfr?: number
  value_nf?: number
  value_nr?: number
  value_mfr?: number
  value_mf?: number
  value_mr?: number
  value_m?: number
  value_h?: number
  demand?: string
  rarity?: string
  section?: string
  category?: string
}

export interface ParseResult {
  items: ExcelItemUpdate[]
  errors: string[]
  warnings: string[]
}

const COLUMN_MAPPINGS: Record<string, string> = {
  // Name variations
  'petname': 'name',
  'pet_name': 'name',
  'pet name': 'name',
  'item': 'name',
  'itemname': 'name',
  'item_name': 'name',
  
  // RAP value variations
  'base': 'rap_value',
  'rap': 'rap_value',
  'base_value': 'rap_value',
  'basevalue': 'rap_value',
  
  // Value variations
  'fr': 'value_fr',
  'f': 'value_f',
  'r': 'value_r',
  'n': 'value_n',
  'nfr': 'value_nfr',
  'nf': 'value_nf',
  'nr': 'value_nr',
  'mfr': 'value_mfr',
  'mf': 'value_mf',
  'mr': 'value_mr',
  'm': 'value_m',
  'h': 'value_h',
}

const VALID_COLUMNS = [
  'name',
  'rap_value',
  'value_fr',
  'value_f',
  'value_r',
  'value_n',
  'value_nfr',
  'value_nf',
  'value_nr',
  'value_mfr',
  'value_mf',
  'value_mr',
  'value_m',
  'value_h',
  'demand',
  'rarity',
  'section',
  'category',
]

export function parseExcelBuffer(buffer: Buffer): ParseResult {
  const items: ExcelItemUpdate[] = []
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' })

    // Get the first sheet
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      errors.push('Excel file has no sheets')
      return { items, errors, warnings }
    }

    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<any>(worksheet, { defval: null })

    if (data.length === 0) {
      errors.push('Excel sheet is empty')
      return { items, errors, warnings }
    }

    const headers = Object.keys(data[0])
    const normalizedHeaders: Record<string, string> = {}
    
    console.log('[v0] Original headers:', headers)
    
    for (const header of headers) {
      const cleaned = header.toLowerCase().trim()
      const mapped = COLUMN_MAPPINGS[cleaned] || cleaned
      normalizedHeaders[header] = mapped
      console.log(`[v0] Mapping "${header}" -> "${cleaned}" -> "${mapped}"`)
    }

    // Check if name column exists (after mapping)
    const hasNameColumn = Object.values(normalizedHeaders).includes('name')
    if (!hasNameColumn) {
      errors.push('Required column "name" or "PetName" not found in Excel file')
      return { items, errors, warnings }
    }

    // Check for invalid columns
    const mappedHeaders = Object.values(normalizedHeaders)
    const invalidColumns = mappedHeaders.filter((h) => !VALID_COLUMNS.includes(h))
    if (invalidColumns.length > 0) {
      warnings.push(`Unknown columns will be ignored: ${invalidColumns.join(', ')}`)
    }

    // Check if at least one value column exists
    const valueColumns = mappedHeaders.filter((h) => h.startsWith('value_') || h === 'rap_value')
    if (valueColumns.length === 0) {
      warnings.push('No value columns found. Only metadata will be updated.')
    }

    // Parse each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNum = i + 2 // Excel row number (1-indexed + header)

      const normalizedRow: any = {}
      for (const key in row) {
        const mappedKey = normalizedHeaders[key]
        normalizedRow[mappedKey] = row[key]
      }

      const name = normalizedRow.name
      if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.push(`Row ${rowNum}: Missing or invalid item name`)
        continue
      }

      const item: ExcelItemUpdate = {
        name: name.trim(),
      }

      const numericFields = [
        'rap_value',
        'value_fr',
        'value_f',
        'value_r',
        'value_n',
        'value_nfr',
        'value_nf',
        'value_nr',
        'value_mfr',
        'value_mf',
        'value_mr',
        'value_m',
        'value_h',
      ]

      const isEmptyValue = (val: any): boolean => {
        if (val === null || val === undefined || val === '') return true
        if (typeof val === 'string') {
          const trimmed = val.trim().toUpperCase()
          return trimmed === 'N/A' || trimmed === 'NA' || trimmed === '-' || trimmed === 'NULL'
        }
        return false
      }

      for (const field of numericFields) {
        const rawValue = normalizedRow[field]
        
        if (isEmptyValue(rawValue)) {
          continue
        }

        const value = Number(rawValue)
        if (isNaN(value) || value < 0) {
          errors.push(`Row ${rowNum}: Invalid ${field} value "${rawValue}" (must be a positive number or N/A)`)
          continue
        }
        if (field === 'value_nf' || field === 'value_n') {
          console.log(`[v0] Row ${rowNum} "${name}": Setting ${field} = ${value}`)
        }
        ;(item as Record<string, any>)[field] = value
      }

      // Parse string fields
      const stringFields = ['demand', 'rarity', 'section', 'category']
      for (const field of stringFields) {
        if (normalizedRow[field] !== null && normalizedRow[field] !== undefined && normalizedRow[field] !== '') {
          ;(item as Record<string, any>)[field] = String(normalizedRow[field]).trim()
        }
      }

      // Only add item if it has at least one field to update besides name
      const updateFields = Object.keys(item).filter((k) => k !== 'name')
      if (updateFields.length === 0) {
        warnings.push(`Row ${rowNum}: Item "${name}" has no fields to update, skipping`)
        continue
      }

      items.push(item)
    }

    if (items.length === 0 && errors.length === 0) {
      errors.push('No valid items found in Excel file')
    }
  } catch (error: any) {
    errors.push(`Failed to parse Excel file: ${error.message}`)
  }

  return { items, errors, warnings }
}

export function generateExampleExcel(): Buffer {
  const data = [
    {
      name: 'Shadow Dragon',
      rap_value: 270000,
      value_fr: 270000,
      value_f: 135000,
      value_r: 135000,
      value_n: 150000,
      demand: 'High',
      rarity: 'Legendary',
      section: 'Pets',
    },
    {
      name: 'Frost Dragon',
      rap_value: 120000,
      value_fr: 120000,
      value_f: 60000,
      value_r: 60000,
      value_n: 65000,
      demand: 'High',
      rarity: 'Legendary',
      section: 'Pets',
    },
    {
      name: 'Bat Dragon',
      rap_value: 230000,
      value_fr: 230000,
      value_f: 115000,
      value_r: 115000,
      value_n: 125000,
      demand: 'Very High',
      rarity: 'Legendary',
      section: 'Pets',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Adopt Me Items')

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return buffer
}
