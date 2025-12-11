// Dataset controller
import Dataset from '../models/Dataset.js';
import AppSpace from '../models/AppSpace.js';
import { parseFile, parseFileSchema, inferSchemaFromRows } from '../utils/fileParser.js';
import path from 'path';
import fs from 'fs';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

// GET /datasets - Get all datasets for an appSpace
const getDatasets = async (req, res) => {
  try {
    const { appSpaceId } = req.query;

    if (!appSpaceId) {
      return res.status(400).json({ error: 'appSpaceId is required' });
    }

    // Verify user owns the appSpace
    const appSpace = await AppSpace.findOne({ _id: appSpaceId, userId: req.user.userId });
    if (!appSpace) {
      return res.status(404).json({ error: 'AppSpace not found' });
    }

    const datasets = await Dataset.find({ appSpaceId });
    return res.status(200).json(datasets);
  } catch (err) {
    console.error('getDatasets error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /datasets/upload - Upload CSV  or JSON or XLSX file
const uploadDataset = async (req, res) => {
  try {
    const { appSpaceId, name } = req.body;

    if (!appSpaceId || !name || !req.file) {
      return res.status(400).json({ error: 'appSpaceId, name, and file are required' });
    }

    // Verify user owns the appSpace
    const appSpace = await AppSpace.findOne({ _id: appSpaceId, userId: req.user.userId });
    if (!appSpace) {
      return res.status(404).json({ error: 'AppSpace not found' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    if (!['csv', 'json', 'xlsx'].includes(ext)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Only CSV, JSON, and XLSX files are supported' });
    }

    // Parse file and extract schema using parseFileSchema
    const { schema, recordsCount, sampleData } = parseFileSchema(filePath);

    const dataset = await Dataset.create({
      appSpaceId,
      name,
      sourceType: ext,
      schema,
      recordsCount,
      filePath,
      createdBy: req.user.userId,
    });

    // Return dataset with schema preview and sample data
    return res.status(201).json({
      dataset: {
        _id: dataset._id,
        name: dataset.name,
        sourceType: dataset.sourceType,
        recordsCount: dataset.recordsCount,
        createdAt: dataset.createdAt,
      },
      schemaPreview: schema,
      sampleData: sampleData.slice(0, 5),
    });
  } catch (err) {
    console.error('uploadDataset error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /datasets/connect - Connect to external database
const connectDatabase = async (req, res) => {
  try {
    const { appSpaceId, name, sourceType, connectionDetails } = req.body;

    if (!appSpaceId || !name || !sourceType || !connectionDetails) {
      return res.status(400).json({ error: 'appSpaceId, name, sourceType, and connectionDetails are required' });
    }

    if (!['postgresql', 'mysql', 'mongodb'].includes(sourceType)) {
      return res.status(400).json({ error: 'sourceType must be postgresql, mysql, or mongodb' });
    }

    // Verify user owns the appSpace
    const appSpace = await AppSpace.findOne({ _id: appSpaceId, userId: req.user.userId });
    if (!appSpace) {
      return res.status(404).json({ error: 'AppSpace not found' });
    }

    let sampleData = [];
    let schema = [];
    let recordsCount = 0;

    // Test connection and fetch sample data based on sourceType
    if (sourceType === 'postgresql') {
      const { host, port, database, user, password, table } = connectionDetails;
      if (!host || !database || !user || !table) {
        return res.status(400).json({ error: 'PostgreSQL requires host, database, user, and table' });
      }

      const client = new pg.Client({ host, port: port || 5432, database, user, password });
      try {
        await client.connect();
        
        // Get sample data (LIMIT 10)
        const sampleResult = await client.query(`SELECT * FROM "${table}" LIMIT 10`);
        sampleData = sampleResult.rows;

        // Get total count
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
        recordsCount = parseInt(countResult.rows[0].count);

        await client.end();
      } catch (dbErr) {
        await client.end().catch(() => {});
        return res.status(400).json({ error: `PostgreSQL connection failed: ${dbErr.message}` });
      }
    } else if (sourceType === 'mysql') {
      const { host, port, database, user, password, table } = connectionDetails;
      if (!host || !database || !user || !table) {
        return res.status(400).json({ error: 'MySQL requires host, database, user, and table' });
      }

      let connection;
      try {
        connection = await mysql.createConnection({ host, port: port || 3306, database, user, password });
        
        // Get sample data (LIMIT 10)
        const [rows] = await connection.execute(`SELECT * FROM \`${table}\` LIMIT 10`);
        sampleData = rows;

        // Get total count
        const [countRows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        recordsCount = parseInt(countRows[0].count);

        await connection.end();
      } catch (dbErr) {
        if (connection) await connection.end().catch(() => {});
        return res.status(400).json({ error: `MySQL connection failed: ${dbErr.message}` });
      }
    } else if (sourceType === 'mongodb') {
      const { uri, database, collection } = connectionDetails;
      if (!uri || !database || !collection) {
        return res.status(400).json({ error: 'MongoDB requires uri, database, and collection' });
      }

      const client = new MongoClient(uri);
      try {
        await client.connect();
        const db = client.db(database);
        const col = db.collection(collection);

        // Get sample data (LIMIT 10)
        sampleData = await col.find({}).limit(10).toArray();

        // Get total count
        recordsCount = await col.countDocuments();

        await client.close();
      } catch (dbErr) {
        await client.close().catch(() => {});
        return res.status(400).json({ error: `MongoDB connection failed: ${dbErr.message}` });
      }
    }

    // Infer schema from sample data
    if (sampleData.length > 0) {
      schema = inferSchemaFromRows(sampleData);
    }

    const dataset = await Dataset.create({
      appSpaceId,
      name,
      sourceType,
      schema,
      recordsCount,
      connectionDetails,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      dataset: {
        _id: dataset._id,
        name: dataset.name,
        sourceType: dataset.sourceType,
        recordsCount: dataset.recordsCount,
        createdAt: dataset.createdAt,
      },
      schemaPreview: schema,
      sampleData: sampleData.slice(0, 5),
    });
  } catch (err) {
    console.error('connectDatabase error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /datasets/:id - Get dataset by ID
const getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id).populate('appSpaceId');

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Verify user owns the appSpace
    if (dataset.appSpaceId.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    return res.status(200).json(dataset);
  } catch (err) {
    console.error('getDatasetById error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /datasets/:id/data - Get dataset data (sample or full)
const getDatasetData = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const dataset = await Dataset.findById(req.params.id).populate('appSpaceId');

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Verify user owns the appSpace
    if (dataset.appSpaceId.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // If file-based dataset
    if (dataset.filePath) {
      const { data } = parseFile(dataset.filePath);
      return res.status(200).json(data.slice(0, parseInt(limit)));
    }

    // Fetch data from external database
    const { connectionDetails, sourceType } = dataset;
    let data = [];

    if (sourceType === 'postgresql') {
      const { host, port, database, user, password, table } = connectionDetails;
      const client = new pg.Client({ host, port: port || 5432, database, user, password });
      try {
        await client.connect();
        const result = await client.query(`SELECT * FROM "${table}" LIMIT $1`, [parseInt(limit)]);
        data = result.rows;
        await client.end();
      } catch (dbErr) {
        await client.end().catch(() => {});
        return res.status(500).json({ error: `Failed to fetch data: ${dbErr.message}` });
      }
    } else if (sourceType === 'mysql') {
      let connection;
      try {
        const { host, port, database, user, password, table } = connectionDetails;
        connection = await mysql.createConnection({ host, port: port || 3306, database, user, password });
        const [rows] = await connection.execute(`SELECT * FROM \`${table}\` LIMIT ?`, [parseInt(limit)]);
        data = rows;
        await connection.end();
      } catch (dbErr) {
        if (connection) await connection.end().catch(() => {});
        return res.status(500).json({ error: `Failed to fetch data: ${dbErr.message}` });
      }
    } else if (sourceType === 'mongodb') {
      const { uri, database, collection } = connectionDetails;
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const db = client.db(database);
        const col = db.collection(collection);
        data = await col.find({}).limit(parseInt(limit)).toArray();
        await client.close();
      } catch (dbErr) {
        await client.close().catch(() => {});
        return res.status(500).json({ error: `Failed to fetch data: ${dbErr.message}` });
      }
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('getDatasetData error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /datasets/:id - Delete dataset
const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id).populate('appSpaceId');

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Verify user owns the appSpace
    if (dataset.appSpaceId.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Delete file if exists
    if (dataset.filePath && fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }

    await Dataset.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Dataset deleted' });
  } catch (err) {
    console.error('deleteDataset error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getDatasets,
  uploadDataset,
  connectDatabase,
  getDatasetById,
  getDatasetData,
  deleteDataset,
};
