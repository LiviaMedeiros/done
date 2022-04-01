import '../common/index.mjs';
import four from '../fixtures/async-error.js';

async function main() {
	try {
		await four();
	} catch (e) {
		console.error(e);
	}
}

main();
