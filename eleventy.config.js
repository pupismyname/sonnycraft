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

	eleventyConfig.addCollection('galleryHome', async (collectionApi) => {
		const gallery = collectionApi.getFilteredByTag('gallery');
		const featured = [];
		const rest = [];
		gallery.forEach((item, i) => {
			if (i >= 40) return;
			if (featured.length < 10 && item.data.tags.includes('featured')) {
				featured.push(item);
			} else {
				rest.push(item);
			}
		});
		return featured.concat(rest);
	});

	eleventyConfig.addCollection('notfeatured', async (collectionsApi) => {
		return collectionsApi.getFilteredByTag('gallery').filter((item) => {
			return !item.data.tags.includes('featured');
		});
	});

	return {
		dir: {
			input: 'content',
		},
	};

};
