import fs from 'fs';
let lines = fs.readFileSync('src/app/admin/StatsPage.tsx', 'utf8').split('\n');
lines = lines.slice(0, 586);
lines.push('          </Card>');
lines.push('        </div>'); // closes div from line 398
lines.push('      </div>'); // closes div from line 316
lines.push('  );');
lines.push('};');
lines.push('');
lines.push('export default AdminStatsPage;');
fs.writeFileSync('src/app/admin/StatsPage.tsx', lines.join('\n'));
