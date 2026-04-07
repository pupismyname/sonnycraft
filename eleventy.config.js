import { DateTime } from 'luxon';

export default async function (eleventyConfig) {

	eleventyConfig.addPassthroughCopy('media');

	eleventyConfig.addFilter('sortAlphabetically', strings =>
		(strings || []).sort((b, a) => b.localeCompare(a))
	);

	eleventyConfig.addFilter('filterTagList', function filterTagList(tags) {
		return (tags || []).filter(tag => [ 'all' ].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter('getKeys', target => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter('niceDate', (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: 'America/Chicago' }).toFormat('DDD, t');
	});

	eleventyConfig.addFilter('json', (obj) => `<pre>${JSON.stringify(obj, null, 2)}</pre>`);

	return {
		dir: {
			input: 'content',
		},
	};

};
