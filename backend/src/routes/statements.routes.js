import { Router } from "express";
import multer from "multer";
import { auth } from "../middlewares/auth.js";
import { importStatement, listStatementProfiles } from "../controllers/statements.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const originalName = file.originalname?.toLowerCase() ?? "";
    const mimetype = file.mimetype?.toLowerCase() ?? "";

    const isPdf = mimetype === "application/pdf" || originalName.endsWith(".pdf");

    const isOfx =
      mimetype === "application/x-ofx" ||
      mimetype === "application/vnd.intu.qfx" ||
      mimetype === "application/xml" ||
      mimetype === "text/xml" ||
      originalName.endsWith(".ofx") ||
      originalName.endsWith(".qfx");

    const isCsv =
      mimetype === "text/csv" ||
      mimetype === "application/vnd.ms-excel" ||
      mimetype === "text/plain" ||
      originalName.endsWith(".csv");

    if (!isPdf && !isOfx && !isCsv) {
      return cb(new Error("INVALID_FILE_TYPE"));
    }

    if (isPdf) file.detectedType = "pdf";
    else if (isOfx) file.detectedType = "ofx";
    else file.detectedType = "csv";
    cb(null, true);
  },
});

const router = Router();

const uploadSingleStatement = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.message === "INVALID_FILE_TYPE") {
      return res
        .status(400)
        .json({ error: "Envie um arquivo PDF, OFX ou CSV válido." });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Arquivo maior do que 5MB." });
    }
    return res.status(500).json({ error: "Não foi possível receber o arquivo." });
  });
};

router.post("/import", auth, uploadSingleStatement, importStatement);
router.get("/profiles", auth, listStatementProfiles);

export default router;
