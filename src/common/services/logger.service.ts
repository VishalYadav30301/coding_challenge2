import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logDir = 'logs';

  constructor() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  log(message: string, context?: string) {
    this.writeToFile('INFO', message, context);
    console.log(`[INFO] ${context ? `[${context}] ` : ''}${message}`);
  }

  error(message: string, trace?: string, context?: string) {
    this.writeToFile('ERROR', message, context, trace);
    console.error(`[ERROR] ${context ? `[${context}] ` : ''}${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string) {
    this.writeToFile('WARN', message, context);
    console.warn(`[WARN] ${context ? `[${context}] ` : ''}${message}`);
  }

  debug(message: string, context?: string) {
    this.writeToFile('DEBUG', message, context);
    console.debug(`[DEBUG] ${context ? `[${context}] ` : ''}${message}`);
  }

  verbose(message: string, context?: string) {
    this.writeToFile('VERBOSE', message, context);
    console.log(`[VERBOSE] ${context ? `[${context}] ` : ''}${message}`);
  }

  private writeToFile(level: string, message: string, context?: string, trace?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}${trace ? '\n' + trace : ''}\n`;
    
    const logFile = path.join(this.logDir, 'app.log');
    fs.appendFileSync(logFile, logMessage);
  }
} 