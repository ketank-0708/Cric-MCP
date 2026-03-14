import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

export async function downloadMatches(matchTypes: string[] = ['t20i', 'odi']) {
	if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
	for (const t of matchTypes) {
		const dir = path.join(DATA_DIR, t);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	}
	console.error(`Prepared data directories: ${matchTypes.join(', ')}`);
}