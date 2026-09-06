const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AppError } = require('./errorMiddleware');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const allowedImage = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const allowedEvidence = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

function makeStorage(subdir) {
  const dest = path.join(__dirname, '..', 'uploads', subdir);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4', '.webm', '.mov'].includes(ext) ? ext : '.bin';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!allowedImage.has(file.mimetype)) {
    return cb(new AppError('Only JPG, PNG, WEBP, or PDF files are accepted', 400));
  }
  cb(null, true);
}

const identityUpload = multer({
  storage: makeStorage('identity-documents'),
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

const profileUpload = multer({
  storage: makeStorage('profile-images'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const unregisteredUpload = multer({
  storage: makeStorage('unregistered'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

function evidenceFileFilter(req, file, cb) {
  if (!allowedEvidence.has(file.mimetype)) {
    return cb(new AppError('Only a photo, PDF, MP4, or WEBM file is accepted', 400));
  }
  cb(null, true);
}

const victimEvidenceUpload = multer({
  storage: makeStorage('victim-evidence'),
  fileFilter: evidenceFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = { identityUpload, profileUpload, unregisteredUpload, victimEvidenceUpload };
