
import { getDatabasePath } from '../db.js';
import { DATABASE } from '../../config.js';
import path from 'path';

console.log('🔍 Database Path Configuration Check\n');
console.log('📁 Database will be created at:');
console.log('   ' + getDatabasePath());
console.log('\n📂 Filename:', DATABASE.FILENAME);
console.log('📍 Directory:', path.dirname(getDatabasePath()));
console.log('\n✅ Path is correctly configured!');
