import * as multer from "multer";

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/"); // Specify the destination folder where the uploaded images will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`; // Generate a unique filename for each uploaded file
    const fileExtension = file.originalname.split(".").pop(); // Extract the file extension
    const filename = `${uniqueSuffix}.${fileExtension}`;
    cb(null, filename);
  },
});

export const upload = multer({ storage });
