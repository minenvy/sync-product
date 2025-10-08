export type StagedFileRequest = {
  filename: string;
  mimeType: string;
  httpMethod: "POST";
  resource: "PRODUCT_IMAGE";
};

export type StagedFileResponse = {
  stagedUploadsCreate: {
    stagedTargets: Array<{
      url: string;
      resourceUrl: string;
      parameters: Array<{
        name: string;
        value: string;
      }>;
    }>;
  };
};

export type FileRequest = {
  alt?: string;
  contentType: "IMAGE";
  originalSource: string;
};

export type FileResponse = {
  fileCreate: {
    files: Array<{
      id: string;
      fileStatus: string;
      alt: string;
      createdAt: string;
      image: {
        width: number;
        height: number;
      };
    }>;
  };
};
