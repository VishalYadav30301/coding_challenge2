import { Injectable, Req, Res, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class S3BucketService {
  private readonly logger = new Logger(S3BucketService.name);
  private readonly AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  private readonly s3: AWS.S3;

  constructor() {
    if (
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      throw new Error('AWS credentials are not properly configured');
    }

    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async listObject(): Promise<any> {
    this.logger.log('Listing objects in S3 bucket');

    if (!this.AWS_S3_BUCKET) {
      throw new Error(
        'AWS_S3_BUCKET is not defined in the environment variables',
      );
    }

    var params = {
      Bucket: this.AWS_S3_BUCKET,
      Delimiter: '/',
    };

    let result = await this.s3.listObjectsV2(params).promise();

    console.log('List object: ' + result);
    return result;
  }

  async downloadFile() {
    this.logger.log('Downloading file from S3 bucket ');

    var params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: 'example-file.txt',
      Expires: 36000,
    };

    const url = await this.s3.getSignedUrl('getObject', params);

    console.log('Url to download file: ' + url);
    return url;
  }

  async getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET is not defined');
    }

    const params: AWS.S3.GetObjectRequest = {
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', {
        ...params,
        Expires: expiresIn,
      });
      this.logger.log(`Generated download URL for ${key}`);
      return url;
    } catch (e) {
      this.logger.error('Error generating download URL', e);
      throw e;
    }
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (!this.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET is not defined');
    }

    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('putObject', params);
      this.logger.log(`Generated upload URL for ${key}`);
      return url;
    } catch (e) {
      this.logger.error('Error generating upload URL', e);
      throw e;
    }
  }
  async deleteObject(key: string): Promise<any> {
    this.logger.log(`Deleting file: ${key}`);

    if (!this.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET is not defined');
    }
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
    };

    try {
      const response = await this.s3.deleteObject(params).promise();
      this.logger.log(`Deleted file ${key} successfully`);
      return response;
    } catch (e) {
      this.logger.error('Error deleting file', e);
      throw e;
    }
  }
}