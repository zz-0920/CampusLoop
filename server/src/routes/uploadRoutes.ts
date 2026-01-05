import Router from "koa-router";
// @ts-expect-error - @koa/multer lacks type definitions
import multer from "@koa/multer";
import path from "path";
import fs from "fs";
import type { Context } from "koa";

const router = new Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const storage = multer.diskStorage({
  destination: function (
    _req: unknown,
    _file: MulterFile,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, uploadDir);
  },
  filename: function (
    _req: unknown,
    file: MulterFile,
    cb: (error: Error | null, filename: string) => void
  ) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 9, // Max 9 files
  },
});

// Single file upload (backward compatible)
router.post(
  "/upload",
  upload.single("file"),
  async (ctx: Context & { file?: MulterFile }) => {
    if (!ctx.file) {
      ctx.status = 400;
      ctx.body = { error: "No file uploaded" };
      return;
    }

    const protocol = ctx.protocol;
    const host = ctx.get("host");
    const url = `${protocol}://${host}/${ctx.file.filename}`;

    ctx.body = {
      url: url,
      filename: ctx.file.filename,
      mimetype: ctx.file.mimetype,
      size: ctx.file.size,
    };
  }
);

// Multiple files upload (max 9)
router.post(
  "/upload/multiple",
  upload.array("files", 9),
  async (ctx: Context & { files?: MulterFile[] }) => {
    if (!ctx.files || ctx.files.length === 0) {
      ctx.status = 400;
      ctx.body = { error: "No files uploaded" };
      return;
    }

    const protocol = ctx.protocol;
    const host = ctx.get("host");

    const uploadedFiles = ctx.files.map((file) => ({
      url: `${protocol}://${host}/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    }));

    ctx.body = {
      files: uploadedFiles,
      count: uploadedFiles.length,
    };
  }
);

export default router;
