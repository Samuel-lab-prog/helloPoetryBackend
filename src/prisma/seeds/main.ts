
async function seedAll() {
	console.log('🟢 Starting seeds...');
}

seedAll()
	.then(() => {
		console.log('🎉 All seeds completed');
		process.exit(0);
	})
	.catch((e) => {
		console.error('❌ Seed failed', e);
		process.exit(1);
	});
