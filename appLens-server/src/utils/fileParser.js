import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import XLSX from 'xlsx';

/**
 * Parse a CSV file using PapaParse and return data with schema
 * @param {string} filePath - Path to the CSV file
 * @returns {{ data: Array, schema: Array, recordsCount: number }}
 */
export const parseCSV = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const records = result.data;
  const schema = inferSchemaFromRows(records.slice(0, 20));
  return {
    data: records,
    schema,
    recordsCount: records.length,
  };
};

/**
 * Parse a JSON file and return data with schema
 * @param {string} filePath - Path to the JSON file
 * @returns {{ data: Array, schema: Array, recordsCount: number }}
 */
export const parseJSON = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(fileContent);
  const records = Array.isArray(data) ? data : [data];

  const schema = inferSchemaFromRows(records.slice(0, 20));
  return {
    data: records,
    schema,
    recordsCount: records.length,
  };
};

/**
 * Parse an Excel file (.xlsx) and return data with schema
 * @param {string} filePath - Path to the Excel file
 * @returns {{ data: Array, schema: Array, recordsCount: number }}
 */
export const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Read first sheet
  const worksheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json(worksheet, { 
    defval: null,
    raw: false, // Convert dates and numbers to strings for consistency
  });

  const schema = inferSchemaFromRows(records.slice(0, 20));
  return {
    data: records,
    schema,
    recordsCount: records.length,
  };
};

/**
 * Infer schema from the first N rows for better type detection
 * @param {Array} rows - Array of data objects (first 20 rows)
 * @returns {Array} - Schema array with field, type, exampleValue, sampleValues
 */
export const inferSchemaFromRows = (rows) => {
  if (!rows || rows.length === 0) return [];

  const fields = Object.keys(rows[0]);
  const schema = [];

  for (const field of fields) {
    const values = rows.map((row) => row[field]).filter((v) => v !== null && v !== undefined && v !== '');
    const sampleValues = values.slice(0, 5);
    const type = inferTypeFromValues(values);
    
    schema.push({
      field,
      type,
      exampleValue: sampleValues[0] ?? null,
      sampleValues,
    });
  }

  return schema;
};

/**
 * Infer type from multiple values for better accuracy
 * @param {Array} values - Array of values to analyze
 * @returns {string} - The most likely type
 */
export const inferTypeFromValues = (values) => {
  if (!values || values.length === 0) return 'string';

  const typeCounts = { integer: 0, float: 0, boolean: 0, date: 0, string: 0 };

  for (const value of values) {
    const type = inferType(value);
    typeCounts[type]++;
  }

  // Return the most common type
  return Object.entries(typeCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
};

/**
 * Legacy: Infer schema from an array of records (uses first row only)
 * @param {Array} records - Array of data objects
 * @returns {Array} - Schema array with field, type, exampleValue
 */
export const inferSchema = (records) => {
  return inferSchemaFromRows(records.slice(0, 20));
};

/**
 * Infer the type of a value
 * @param {any} value - The value to check
 * @returns {string} - The inferred type
 */
export const inferType = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'string';
  }

  // Check for number
  if (!isNaN(Number(value)) && value !== '') {
    return Number.isInteger(Number(value)) ? 'integer' : 'float';
  }

  // Check for boolean
  if (value === 'true' || value === 'false' || typeof value === 'boolean') {
    return 'boolean';
  }

  // Check for date
  const date = new Date(value);
  if (!isNaN(date.getTime()) && typeof value === 'string' && value.match(/\d{4}-\d{2}-\d{2}/)) {
    return 'date';
  }

  return 'string';
};

/**
 * Parse file based on extension
 * @param {string} filePath - Path to the file
 * @returns {{ data: Array, schema: Array, recordsCount: number }}
 */
export const parseFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.csv':
      return parseCSV(filePath);
    case '.json':
      return parseJSON(filePath);
    case '.xlsx':
      return parseExcel(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

/**
 * Parse file and return schema preview with sample data
 * @param {string} filePath - Path to the file
 * @returns {{ schema: Array, recordsCount: number, sampleData: Array }}
 */
export const parseFileSchema = (filePath) => {
  const { data, schema, recordsCount } = parseFile(filePath);
  const sampleData = data.slice(0, 20);
  
  return {
    schema,
    recordsCount,
    sampleData,
  };
};

export default {
  parseCSV,
  parseJSON,
  parseExcel,
  parseFile,
  parseFileSchema,
  inferSchema,
  inferSchemaFromRows,
  inferType,
  inferTypeFromValues,
};
