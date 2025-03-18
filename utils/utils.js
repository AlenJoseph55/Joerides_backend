// utils/prisma.js
import { PrismaClient } from '@prisma/client';
import express from "express";


const router = express.Router();
const prisma = new PrismaClient();

export {prisma,router};