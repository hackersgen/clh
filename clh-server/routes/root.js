'use strict'

const fs = require('fs/promises');
const path = require('path');
const { default: badWords } = require('../utils/badwords');
const { SafeWrite } = require('../utils/common');

const MAX_LEADERS = 1000;

module.exports = async function (fastify, opts) {
  fastify.post('/leaderboard/export', async function (request, reply) {
    const { body } = request

    try {
      const leaders = body.leaders || [];

      if (leaders.length === 0) {
        return reply.code(400).send({ error: 'No leaderboard data provided' });
      }

      const headers = Object.keys(leaders[0]).join(',');
      const rows = leaders.map(leader => {
        return Object.values(leader).map(value => {
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',');
      });

      // const outputDir = path.join(__dirname, '../');
      const outputDir = path.join(__dirname, '../leaderboard/');
      await fs.mkdir(outputDir, { recursive: true });

      const filename = 'leaderboard.csv';
      const filepath = path.join(outputDir, filename);

      let fileExists = false;
      try {
        await fs.access(filepath);
        fileExists = true;
      } catch (err) {}

      let csvContent;
      if (fileExists) {
        const existingContent = await fs.readFile(filepath, 'utf8');
        const existingLines = existingContent.split('\n');
        const existingHeaders = existingLines[0];

        if (existingHeaders !== headers) {
          return reply.code(400).send({
            error: 'Schema mismatch',
            message: 'The schema of the new data does not match the existing file'
          });
        }

        const existingData = existingLines.slice(1)
          .filter(line => line.trim().length > 0)
          .map(line => {
            const values = line.split(',');
            const record = {};
            headers.split(',').forEach((header, index) => {
              record[header] = values[index];
            });
            return record;
          });

        const uniqueLeaders = leaders.filter(newLeader => {
          return !existingData.some(existingLeader =>
            existingLeader.name === newLeader.name && existingLeader.score === newLeader.score
          );
        });

        if (uniqueLeaders.length === 0) {
          return {
            success: true,
            message: 'No new unique records to add'
          };
        }

        const newRows = uniqueLeaders.map(leader => {
          return Object.values(leader).map(value => {
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          }).join(',');
        });

        csvContent = '\n' + newRows.join('\n');
        await fs.appendFile(filepath, csvContent);

        return {
          success: true,
          message: `${uniqueLeaders.length} new records appended successfully`,
          skipped: leaders.length - uniqueLeaders.length
        };
      } else {
        csvContent = [headers, ...rows].join('\n');
        await fs.writeFile(filepath, csvContent);

        return {
          success: true,
          message: 'Leaderboard data file created successfully',
          added: leaders.length
        };
      }

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to save leaderboard data',
        message: error.message
      });
    }
  });

  fastify.post('/leaderboard/check-nickname-profanity', async function (request, reply) {
    const { body } = request;
    const name = body.name || '';

    if (name.trim().length === 0) {
      return reply.code(400).send({ error: 'Name is required' });
    }

    // check from badwords.js file
    const isProfanity = badWords.includes(name.toLowerCase());
    return reply.code(200).send({ isProfanity });
  });

  fastify.post('/leaderboard/entry', async function (request, reply) {
    const { leader } = request.body;
  
    if (!leader || typeof leader !== 'object') {
      return reply.code(400).send({ error: 'No leader data provided' });
    }
  
    const outputDir = path.join(__dirname, '../leaderboard/');
    await fs.mkdir(outputDir, { recursive: true });
  
    const filename = 'leaderboard.csv';
    const filepath = path.join(outputDir, filename);
  
    const headers = Object.keys(leader).join(',');
    const row = Object.values(leader).map(value => {
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',');
  
    let fileExists = false;
    try {
      await fs.access(filepath);
      fileExists = true;
    } catch (err) {}
  
    if (fileExists) {
      const existingContent = await fs.readFile(filepath, 'utf8');
      const existingLines = existingContent.split('\n');
      const existingHeaders = existingLines[0];
  
      if (existingHeaders !== headers) {
        return reply.code(400).send({
          error: 'Schema mismatch',
          message: 'The schema of the new entry does not match the existing file'
        });
      }

      // Check if max entries reached (excluding header)
      if (existingLines.length - 1 >= MAX_LEADERS) {
        return reply.code(400).send({
          error: 'Maximum number of entries reached',
          message: `Cannot add more than ${MAX_LEADERS} leaderboard entries`
        });
      }
  
      await SafeWrite(filepath, '\n' + row);
      return reply.code(200).send({
        success: true,
        message: 'Entry appended successfully'
      });
    } else {
      await fs.writeFile(filepath, [headers, row].join('\n'));
      return reply.code(200).send({
        success: true,
        message: 'File created and entry added'
      });
    }
  });

  fastify.get('/leaderboard', async function (request, reply) {
    const outputDir = path.join(__dirname, '../leaderboard/');
    const filename = 'leaderboard.csv';
    const filepath = path.join(outputDir, filename);

    try {
      await fs.access(filepath);
    } catch (err) {
      return reply.code(404).send({ error: 'Leaderboard not found' });
    }

    const content = await fs.readFile(filepath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      return record;
    });

    return reply.code(200).send({ leaders: data });
  });
}
