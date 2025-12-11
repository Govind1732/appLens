import express from 'express';
import multer from 'multer';
import path from 'path';
import datasetController from '../controllers/datasetController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv' || ext === '.json' || ext === '.xlsx') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, JSON, and XLSX files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// All routes require authentication
router.use(authMiddleware);

// GET /datasets - Get all datasets for an appSpace
router.get('/', datasetController.getDatasets);

// POST /datasets/upload - Upload CSV or JSON file
router.post('/upload', upload.single('file'), datasetController.uploadDataset);

// POST /datasets/connect - Connect to external database
router.post('/connect', datasetController.connectDatabase);

// GET /datasets/:id - Get dataset by ID
router.get('/:id', datasetController.getDatasetById);

// GET /datasets/:id/data - Get dataset data
router.get('/:id/data', datasetController.getDatasetData);

// DELETE /datasets/:id - Delete dataset
router.delete('/:id', datasetController.deleteDataset);

export default router;
