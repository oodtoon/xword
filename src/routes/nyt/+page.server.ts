export const load = async ({ fetch }) => {
	const res = await fetch('https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json', {
		method: 'GET',
		headers: { 'X-Games-Auth-Bypass': 'true' }
	});
	if (!res.ok) {
		throw new Error('Failed to load answers');
	}

	const game = await res.json();

	return {
		game
	};
};