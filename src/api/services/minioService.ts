import { BucketItem, Client, ClientOptions } from "minio";

// define minio client options based on parameters
const minioClientOptions: ClientOptions = {
  endPoint: "minio",
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER as string,
  secretKey: process.env.MINIO_ROOT_PASSWORD as string,
};

// initialize minio client
const minioClient = new Client(minioClientOptions);

// setup minio bucket for theme jobs
const setUpMinioBucket = async () => {
  try {
    await createBucketIfNotExists("theme-jobs-queue");
  } catch (err) {
    console.error("Failed to initialize MinIO bucket:", err);
  }
};

/**
 * Creates a nucket with the given name if it does not exist.
 *
 * @param bucketName name of bucket to create
 */
const createBucketIfNotExists = async (bucketName: string): Promise<void> => {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, "");
      console.info(`Bucket ${bucketName} created successfully.`);
    } else {
      console.info(`Bucket ${bucketName} already exists.`);
    }
  } catch (err: any) {
    // if bucket already owned, not an error (possible due to multiple api instances)
    if (err.code == "BucketAlreadyOwnedByYou") {
      return;
    }
    console.error("Error checking or creating bucket:", err);
    throw err;
  }
};

/**
 * Uploads a file into the specified bucket.
 *
 * @param bucketName name of bucket
 * @param objectName name of file
 * @param filePath path to file
 */
const uploadFile = async (
  bucketName: string,
  objectName: string,
  filePath: string,
): Promise<void> => {
  try {
    await minioClient.fPutObject(bucketName, objectName, filePath);
    console.info(`File ${objectName} uploaded successfully.`);
  } catch (err: any) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

/**
 * Retrieves a file from the bucket.
 *
 * @param bucketName name of bucket
 * @param objectName name of file
 *
 * @returns file if found, null otherwise
 */
const getFile = async (
  bucketName: string,
  objectName: string,
): Promise<BucketItem | null> => {
  try {
    const objectsStream = minioClient.listObjectsV2(
      bucketName,
      objectName,
      true,
    );
    for await (const obj of objectsStream) {
      if (obj.name === objectName) {
        return obj;
      }
    }
    // if no object is found, return null
    return null;
  } catch (err: any) {
    console.error("Error retrieving file:", err);
    throw err;
  }
};

/**
 * Deletes a file from the specified bucket.
 *
 * @param bucketName name of bucket
 * @param objectName name of file
 */
const deleteFile = async (
  bucketName: string,
  objectName: string,
): Promise<void> => {
  try {
    await minioClient.removeObject(bucketName, objectName);
    console.info(`File ${objectName} deleted successfully.`);
  } catch (err: any) {
    console.error("Error deleting file:", err);
    throw err;
  }
};

export { deleteFile, getFile, setUpMinioBucket, uploadFile };
