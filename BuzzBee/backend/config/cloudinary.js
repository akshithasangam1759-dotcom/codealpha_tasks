const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let uploadPost, uploadAvatar, uploadStory, uploadMessage;

if (hasCloudinary) {
  // ---- Use Cloudinary ----
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const postStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'buzzbee/posts', allowed_formats: ['jpg','jpeg','png','gif','webp','mp4','mp3'], resource_type: 'auto' } });
  const avatarStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'buzzbee/avatars', allowed_formats: ['jpg','jpeg','png','webp'], transformation: [{ width: 400, height: 400, crop: 'fill' }] } });
  const storyStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'buzzbee/stories', allowed_formats: ['jpg','jpeg','png','gif','webp','mp4'], resource_type: 'auto' } });
  const messageStorage = new CloudinaryStorage({ cloudinary, params: { folder: 'buzzbee/messages', allowed_formats: ['jpg','jpeg','png','gif','webp'] } });

  uploadPost = multer({ storage: postStorage });
  uploadAvatar = multer({ storage: avatarStorage });
  uploadStory = multer({ storage: storyStorage });
  uploadMessage = multer({ storage: messageStorage });

  console.log('✅ Cloudinary storage enabled');
} else {
  // ---- Fallback: local disk storage ----
  console.log('ℹ️  Using local disk storage (Cloudinary not configured)');

  const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

  const makeLocalStorage = (folder) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', folder);
    ensureDir(uploadDir);
    return multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
      },
    });
  };

  // Patch: add .path = full public URL to req.file
  const localMiddleware = (storage, folder) => {
    const upload = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|mp4|mp3/;
        cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
      },
    });
    return {
      single: (field) => (req, res, next) => {
        upload.single(field)(req, res, (err) => {
          if (err) return next(err);
          if (req.file) {
            // Make .path a public URL like Cloudinary does
            req.file.path = `/uploads/${folder}/${req.file.filename}`;
          }
          next();
        });
      },
    };
  };

  uploadPost    = localMiddleware(makeLocalStorage('posts'), 'posts');
  uploadAvatar  = localMiddleware(makeLocalStorage('avatars'), 'avatars');
  uploadStory   = localMiddleware(makeLocalStorage('stories'), 'stories');
  uploadMessage = localMiddleware(makeLocalStorage('messages'), 'messages');
}

module.exports = { cloudinary, uploadPost, uploadAvatar, uploadStory, uploadMessage, hasCloudinary };