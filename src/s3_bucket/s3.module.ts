import { Module } from '@nestjs/common';
import { S3BucketService } from './s3.service';

@Module({
  providers: [S3BucketService],
  exports: [S3BucketService],
})
export class S3BucketModule {}
