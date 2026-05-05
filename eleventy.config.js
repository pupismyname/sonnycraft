import { DateTime } from 'luxon';
import { eleventyImageTransformPlugin as imagePlugin } from '@11ty/eleventy-img';
import draftPlugin from './eleventy.config.drafts.js';
import feedPlugin from '@11ty/eleventy-plugin-rss';

export default async function (eleventyConfig) {

	//--
	// copy assets
	//--

	eleventyConfig.addPassthroughCopy('styles'); // Stylesheets, no build step
	eleventyConfig.addPassthroughCopy('content/images', 'images'); // Non-portfolio images
	eleventyConfig.addPassthroughCopy('content/media', 'media'); // Portfolio images from PagesCMS
	eleventyConfig.addPassthroughCopy('content/img', 'img'); // Cached images from 11ty-img

	//--
	// plugins
	//--

	eleventyConfig.addPlugin(draftPlugin); // Don't build drafts in production.
	eleventyConfig.addPlugin(feedPlugin); // Create an RSS feed from the portfolio.
	// TLDR: Run `npm run images` from time to time and check the results into git.
	// The 11ty-img plugin creates optimized versions of images on the site, removes EXIF data for
	// privacy, and modifies <img> tags in the html to support multiple sizes. It's smart enough to
	// not re-build images that already exist in the _site/img output folder, but by default, this
	// folder doesn't exist in production builds. As the number of images increases, the build time
	// increases. To reduce the build time and potential server costs, the npm task `npm run images`
	// should be periodically run locally and the results checked into git.
	eleventyConfig.addPlugin(imagePlugin, {
		widths: [ 850, 'auto' ],
		formats: [ 'auto', 'svg', 'webp' ],
		svgShortCircuit: true,
		htmlOptions: {
			imgAttributes: {
				loading: 'lazy',
			},
		},
	});

	//--
	// filters
	//--

	// A human readable date.
	eleventyConfig.addFilter('niceDate', (dateString) => {
		return DateTime.fromISO(dateString, 'yyyy-MM-ddTHH:mm', { zone: 'America/Chicago' }).toFormat('DDD, t');
	});

	//--
	// collections
	//--

	// All the featured portfolio items.
	eleventyConfig.addCollection('featured', async (collectionApi) => {
		const portfolio = collectionApi.getFilteredByTag('portfolio');
		return portfolio.filter((item) => item.data.featured);
	});

	// The 10 most recent featured items, followed by the 30 most recent items not already included
	// in the first 10. The goal is 40 total items, even if there aren't 10 featured items.
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

	// Gather the categories that are actually in use.
	eleventyConfig.addCollection('categories', async (collectionApi) => {
		const portfolio = collectionApi.getFilteredByTag('portfolio');
		const categories = new Set();
		portfolio.forEach((item) => {
			item.data.categories?.forEach((category) => categories.add(category));
		});
		return Array.from(categories);
	});

	return {
		dir: {
			input: 'content',
		},
	};

};
