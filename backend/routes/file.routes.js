const express = require('express');
const multer = require('multer');
const config = require('../utils/config');
const { uploadFile, listFiles, deleteFile } = require('../controllers/file.controller');
const { requireRole } = require('../middleware/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.storage.maxUploadMb * 1024 * 1024
  }
});

const router = express.Router();

// Legacy route
router.post('/upload-file', requireRole(['admin', 'operator']), upload.single('file'), uploadFile);

// RESTful routes
router.post('/files', requireRole(['admin', 'operator']), upload.single('file'), uploadFile);
router.get('/files', requireRole(['admin', 'operator', 'viewer']), listFiles);
router.delete('/files/:id', requireRole(['admin', 'operator']), deleteFile);

module.exports = router;
