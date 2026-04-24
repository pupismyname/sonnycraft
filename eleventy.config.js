import { DateTime } from 'luxon';

export default async function (eleventyConfig) {

	// 'passthrough' only applies to --serve or --watch
	eleventyConfig.setServerPassthroughCopyBehavior('passthrough');
	eleventyConfig.addPassthroughCopy('media');
	eleventyConfig.addPassthroughCopy('styles');

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

	// for debug
	eleventyConfig.addFilter('json', (obj) => {
		return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
	});

	// Build a list of 40 portfolio items. The first 10 featured items are bumped to the top.
	eleventyConfig.addCollection('portfolioHome', async (collectionApi) => {
		const featured = 10;
		const other = 30;
		const portfolio = collectionApi.getFilteredByTag('portfolio');
		const featuredItems = [];
		const otherItems = [];
		for (const item of portfolio) {
			// Get out if we have enough of both types of items.
			if (featuredItems.length >= featured && otherItems.length >= other) break;
			if (featuredItems.length < featured && item.data.tags.includes('featured')) {
				featuredItems.push(item);
			} else {
				otherItems.push(item);
			}
		}
		// Concat the two lists and slice off any extra.
		return featuredItems.concat(otherItems).slice(0, featured + other);
	});

	eleventyConfig.addCollection('notfeatured', async (collectionsApi) => {
		return collectionsApi.getFilteredByTag('portfolio').filter((item) => {
			return !item.data.tags.includes('featured');
		});
	});

	return {
		dir: {
			input: 'content',
		},
	};

};
