
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching database schema...');
    try {
        const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

        let output = 'DATABASE SCHEMA REPORT\n======================\n\n';

        for (const table of tables) {
            output += `TABLE: ${table.table_name}\n`;
            output += `----------------------------------------\n`;

            const columns = await prisma.$queryRaw<Array<{ column_name: string, data_type: string, is_nullable: string }>>`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${table.table_name}
      `;

            columns.forEach(col => {
                output += `  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})\n`;
            });
            output += '\n';
        }

        fs.writeFileSync('db_schema_dump.txt', output);
        console.log('Schema dumped to db_schema_dump.txt');
    } catch (e) {
        console.error('Error querying database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
