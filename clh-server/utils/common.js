import { promises as fs } from "fs";

let writeQueue = Promise.resolve(); // queue holder

export const SafeWrite = (filePath, data) => {
  // Add a write task to the queue
  writeQueue = writeQueue
    .then(() => fs.appendFile(filePath, data)) // append instead of overwrite
    .catch(err => console.error("Write error:", err));

  return writeQueue;
}