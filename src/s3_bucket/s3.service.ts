import { BadRequestException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';


@Injectable()

export class S3Service {
  private s3: AWS.S3;
  private readonly  bucketName;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS.AWS_REGION'),
      accessKeyId: this.configService.get<string>('AWS.AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS.AWS_SECRET_ACCESS_KEY'),
    });
    this.bucketName = this.configService.get<string>('AWS.AWS_S3_BUCKET_NAME');
    
  }


  async generatePreSignedUrl(key: string, contentType: string, expiresInSeconds: number = 3000): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresInSeconds,
      ContentType: contentType,
       
    };
    console.log(params)


    try {
      const uri = await this.s3.getSignedUrlPromise('putObject', params);
      console.log(uri);
      return uri;
    } catch (error) {
      
      throw new BadRequestException("Exist")
    }
  }
  
  async getDownloadUrl(key: string, expiresIn: number = 360000): Promise<string> {
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET is not defined');
    }

    const params: AWS.S3.GetObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', {
        ...params,
        Expires: expiresIn,
      });
      
      return url;
    } catch (e) {
      
      throw e;
    }
  }

  getPublicUrl(key: string): string {
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET is not defined');
    }
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };
  
    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new BadRequestException('Failed to delete old image');
    }
  }
  
}