/* eslint-disable @typescript-eslint/no-explicit-any */
import ImageKit from 'imagekit';

  const { NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY, NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT } =
  process.env;

interface FileObject {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
}

const imageKit = new ImageKit({
  publicKey: NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? "",
  privateKey: NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY ?? "",
  urlEndpoint: NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "",
});

async function uploadFile(file: FileObject): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const base64Data = file.buffer.toString("base64");
      const fileUploaded = await imageKit.upload({
        file: base64Data,
        fileName: file.originalname,
      });
      resolve(fileUploaded.url);
    } catch (error) {
      reject(error);
    }
  });
}

async function getFileId(filename: string): Promise<string | number> {
  return new Promise(async (resolve, reject) => {
    try {
      const fileId: any = await imageKit.listFiles({
        searchQuery: `name="${filename.split('/').slice(-1)[0]}"`,
      });
      if (fileId[0]) {
        resolve(fileId[0].fileId);
      }
      resolve(0);
    } catch (error) {
      reject(error);
    }
  });
}

async function deleteFile(filename: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      if(filename == "https://ik.imagekit.io/8zmr0xxik/Colorful%20Gradient%20Background%20Man%203D%20Avatar.png") {
        return resolve(null);
      }
      const fileId: any = await getFileId(filename);
      if(fileId) {
        const deletedFile = await imageKit.deleteFile(fileId);
        resolve(deletedFile);
      }
      resolve(null);
    } catch (error) {
      reject(error);
    }
  });
}

async function validationFile(
  file: any, 
  type: "image" | "document" = "image", 
  res: any
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      if (type === "image") {
        const allowedMimeType = ["image/jpeg", "image/png", "image/jpg"];
        if (!file.mimetype) {
          if (!allowedMimeType.includes(file[0].mimetype)) {
            return res.status(400).json({
              status: false,
              message: "File must be an image",
            });
          }
        } else if(!allowedMimeType.includes(file.mimetype)) {
          return res.status(400).json({
            status: false,
            message: "File must be an image",
          });
        }
      } else {
        const allowedMimeType = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ];
        if (!allowedMimeType.includes(file[0].mimetype)) {
          return res.status(400).json({
            status: false,
            message: "File must be an pdf or word",
          });
        }
      }
      if(file.mimetype) {
        const upload = await uploadFile(file);
        return resolve(upload);
      }
      const upload = await uploadFile(file[0]);
      resolve(upload);
    } catch (error) {
      reject(error);
    }
  });
}

export {
  uploadFile,
  getFileId,
  deleteFile,
  validationFile
};