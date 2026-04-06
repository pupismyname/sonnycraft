export default async function (eleventyConfig) {

	eleventyConfig.addPassthroughCopy('media');

	return {
		dir: {
			input: "content",
		},
	};

};
