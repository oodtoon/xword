const getCentralDate = () => {
	const formatter = new Intl.DateTimeFormat('en-CA', { 
		timeZone: 'America/Chicago',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
	return formatter.format(new Date());
};

export const load = async ({ fetch, url }) => {
	const date = url.searchParams.get('date') || getCentralDate();

	let apiUrl = 'https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json';
	if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
		apiUrl = `https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/${date}.json`;
	}

	const res = await fetch(apiUrl, {
		method: 'GET',
		headers: { 'X-Games-Auth-Bypass': 'true' }
	});
	if (!res.ok) {
		throw new Error('Failed to load mini game. Check date format.');
	}

	const game = await res.json();

	return {
		game
	};
};
