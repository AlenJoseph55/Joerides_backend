// utils/prisma.js
const { PrismaClient } = require('@prisma/client');
const express = require("express");


const router = express.Router();
const prisma = new PrismaClient();

module.exports = {prisma,router};