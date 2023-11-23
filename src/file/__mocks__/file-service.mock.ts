import { IFileService } from '../interfaces/IFileService';

export const fileServiceMock: IFileService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
};
