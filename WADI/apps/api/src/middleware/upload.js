import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/plain" ||
      file.mimetype === "text/markdown"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Formato no soportado. Solo PDF, TXT o MD."), false);
    }
  },
});
