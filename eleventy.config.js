import { DateTime } from 'luxon';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';
import pluginDrafts from './eleventy.config.drafts.js';

export default async function (eleventyConfig) {

	eleventyConfig.addPlugin(pluginDrafts);

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

	eleventyConfig.addFilter('niceDate', (dateString) => {
		return DateTime.fromISO(dateString, 'yyyy-MM-ddTHH:mm', { zone: 'America/Chicago' }).toFormat('DDD, t');
	});

	// for debug
	eleventyConfig.addFilter('json', (obj) => {
		console.log(obj);
		return obj;
		// return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
	});

	eleventyConfig.addCollection('featured', async (collectionApi) => {
		const portfolio = collectionApi.getFilteredByTag('portfolio');
		return portfolio.filter((item) => item.data.featured);
	});

	// Build a list of 40 portfolio items. The first 10 featured items are bumped to the top.
	eleventyConfig.addCollection('portfolioHome', async (collectionApi) => {
		const featured = 10;
		const other = 30;
		const portfolio = collectionApi.getFilteredByTag('portfolio');
		const featuredItems = [];
		const otherItems = [];
		// use a for loop instead of forEach so it's easy to break out
		for (const item of portfolio) {
			// Get out if we have enough of both types of items.
			if (featuredItems.length >= featured && otherItems.length >= other) break;
			if (featuredItems.length < featured && item.data.featured) {
				featuredItems.push(item);
			} else {
				otherItems.push(item);
			}
		}
		// Concat the two lists and slice off any extra.
		return featuredItems.concat(otherItems).slice(0, featured + other);
	});

	eleventyConfig.addCollection('categories', async (collectionApi) => {
		const portfolio = collectionApi.getFilteredByTag('portfolio');
		const categories = new Set();
		portfolio.forEach((item) => {
			item.data.categories.forEach((category) => categories.add(category));
		});
		return Array.from(categories);
	});

	return {
		dir: {
			input: 'content',
		},
	};

};
