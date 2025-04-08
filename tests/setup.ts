import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import { tokenApprovalRouter } from '../src/modules/token-approval-detector/router';

// Create a test app instance
export const testApp = express();

// Configure middleware
testApp.use(bodyParser.json());

// Register routers
testApp.use('/token-approval', tokenApprovalRouter);

// Global Jest setup
beforeAll(() => {
  console.log('Starting test suite setup');
});

afterAll(() => {
  console.log('Completed test suite teardown');
}); 