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

    // Validate headers
    const headers = Object.keys(data[0]).map((h) => h.toLowerCase().trim())
    if (!headers.includes('name')) {
      errors.push('Required column "name" not found in Excel file')
      return { items, errors, warnings }
    }

    // Check for invalid columns
    const invalidColumns = headers.filter((h) => !VALID_COLUMNS.includes(h))
    if (invalidColumns.length > 0) {
      warnings.push(`Unknown columns will be ignored: ${invalidColumns.join(', ')}`)
    }

    // Check if at least one value column exists
    const valueColumns = headers.filter((h) => h.startsWith('value_') || h === 'rap_value')
    if (valueColumns.length === 0) {
      warnings.push('No value columns found. Only metadata will be updated.')
    }

    // Parse each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNum = i + 2 // Excel row number (1-indexed + header)

      // Normalize keys to lowercase
      const normalizedRow: any = {}
      for (const key in row) {
        normalizedRow[key.toLowerCase().trim()] = row[key]
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

      for (const field of numericFields) {
        if (normalizedRow[field] !== null && normalizedRow[field] !== undefined && normalizedRow[field] !== '') {
          const value = Number(normalizedRow[field])
          if (isNaN(value) || value < 0) {
            errors.push(`Row ${rowNum}: Invalid ${field} value "${normalizedRow[field]}" (must be a positive number)`)
            continue
          }
          ;(item as Record<string, any>)[field] = value
        }
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
