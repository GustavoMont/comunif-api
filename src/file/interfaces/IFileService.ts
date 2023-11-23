export interface IFileService {
  uploadFile(filePath: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
}

export const IFileService = Symbol('IFileService');
