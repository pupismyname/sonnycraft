import { DateTime } from 'luxon';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';

export default async function (eleventyConfig) {

	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		widths: [ 850, 'auto' ],
		htmlOptions: {
			imgAttributes: {
				loading: 'lazy',
			},
		},
	});

	// 'passthrough' only applies to --serve or --watch
	// eleventyConfig.setServerPassthroughCopyBehavior('passthrough');
	eleventyConfig.addPassthroughCopy('content/media', 'media');
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

	eleventyConfig.addFilter('filterTags', (tags) => {
		if (!tags) return [];
		return filterTags(tags).sort();
	});

	// for debug
	eleventyConfig.addFilter('json', (obj) => {
		return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
	});

	// Build a list of 40 portfolio items. The first 10 featured items are bumped to the top.
	eleventyConfig.addCollection('portfolioHome', async (collectionApi) => {
		const featured = 10;
		const other = 30;
		const portfolio = collectionApi.getFilteredByTag('Portfolio');
		const featuredItems = [];
		const otherItems = [];
		for (const item of portfolio) {
			// Get out if we have enough of both types of items.
			if (featuredItems.length >= featured && otherItems.length >= other) break;
			if (featuredItems.length < featured && item.data.tags.includes('Featured')) {
				featuredItems.push(item);
			} else {
				otherItems.push(item);
			}
		}
		// Concat the two lists and slice off any extra.
		return featuredItems.concat(otherItems).slice(0, featured + other);
	});

	eleventyConfig.addCollection('tagList', (collectionApi) => {
		const tagList = new Set();
		collectionApi.getFilteredByTag('Portfolio').forEach((item) => {
			if (!item.data.tags) return;
			const tags = filterTags(item.data.tags);
			tags.forEach((tag) => tagList.add(tag));
		});
		return Array.from(tagList).sort();
	});

	function filterTags (tags) {
		const remove = [ 'Portfolio', 'Test' ];
		return tags.filter((tag) => {
			return !remove.includes(tag);
		});
	}

	return {
		dir: {
			input: 'content',
		},
	};

};
