'use strict';

const marked = require('marked');
const highlighter = require('highlight.js');

const renderer = new marked.Renderer();

// Override render function.
// @see https://marked.js.org/#/USING_PRO.md#renderer
renderer.heading = (text, level) => {
	const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
	return `<h${level} id="${escapedText}"><a class="anchor" href="#${escapedText}"><span class="header-link"/></a>${text}</h${level}>`;
};

// Get tokens from markdown.
exports.lexer = (md) => {
	return marked.lexer(md);
};

// Get the text in the first-level header.
exports.getHeadingFromTokens = (tokens) => {
	if (!tokens || tokens.length <= 0) {return '';}
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.type === 'heading' && token.depth === 1) {
			return token.text;
		}
	}
};

// Render tokens to html.
exports.parserTokens = (tokens) => {
	return marked.parser(tokens, Object.assign(marked.getDefaults(), {
		renderer: renderer,
		highlight: (code) => highlighter.highlightAuto(code).value,
	}));
};

