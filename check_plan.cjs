const fs = require('fs');
const path = require('path');

const planPath = path.join(__dirname, 'PLAN.md');
let content = fs.readFileSync(planPath, 'utf8');

const completedPrefixes = [
    'P1-', 'P2-', 'P3-', 'P4-', 'P5-', 'P6-', 'P7-', 'P8-', 'P9-', 'P10-', 'P11-', 'P12-', 'P13-', 'P14-', 'P15-', 'P16-', 'P17-', 'P20-', 'P22-', 'P23-', 'P24-', 'P25-', 'P26-'
];

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('- [ ] ')) {
        const match = line.match(/- \[ \] (P\d+-T\d+)/);
        if (match) {
            const taskId = match[1];
            const prefix = taskId.split('T')[0];
            if (completedPrefixes.includes(prefix)) {
                lines[i] = line.replace('- [ ] ', '- [x] ');
            }
        }
    }
}

fs.writeFileSync(planPath, lines.join('\n'), 'utf8');
console.log('Checked off completed tasks in PLAN.md');
