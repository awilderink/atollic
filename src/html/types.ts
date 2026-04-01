export type Children =
	| string
	| number
	| boolean
	| null
	| undefined
	| Children[];

export type Component<T = {}> = (
	props: T & { children?: Children },
) => string | Promise<string>;

// ---------------------------------------------------------------------------
// HTML attribute types
// ---------------------------------------------------------------------------

export interface HtmlGlobalAttributes {
	accesskey?: string;
	autocapitalize?: string;
	autofocus?: boolean;
	class?: string;
	contenteditable?: "" | "true" | "false" | "plaintext-only" | boolean;
	dir?: "ltr" | "rtl" | "auto";
	draggable?: "true" | "false" | boolean;
	enterkeyhint?:
		| "enter"
		| "done"
		| "go"
		| "next"
		| "previous"
		| "search"
		| "send";
	hidden?: "" | "hidden" | "until-found" | boolean;
	id?: string;
	inert?: boolean;
	inputmode?:
		| "none"
		| "text"
		| "tel"
		| "url"
		| "email"
		| "numeric"
		| "decimal"
		| "search";
	is?: string;
	itemid?: string;
	itemprop?: string;
	itemref?: string;
	itemscope?: boolean;
	itemtype?: string;
	lang?: string;
	nonce?: string;
	part?: string;
	popover?: "" | "auto" | "manual";
	role?: string;
	slot?: string;
	spellcheck?: "true" | "false" | boolean;
	style?: string;
	tabindex?: number | string;
	title?: string;
	translate?: "yes" | "no";

	// data-* and aria-*
	[attr: `data-${string}`]: string | number | boolean | undefined;
	[attr: `aria-${string}`]: string | number | boolean | undefined;

	// Event handlers (as strings for server-rendered HTML)
	[attr: `on${string}`]: string | undefined;

	// innerHTML support
	innerHTML?: string;
	dangerouslySetInnerHTML?: { __html: string };

	children?: Children;
}

// ---------------------------------------------------------------------------
// Element-specific attributes
// ---------------------------------------------------------------------------

export interface HtmlAnchorAttributes extends HtmlGlobalAttributes {
	download?: string | boolean;
	href?: string;
	hreflang?: string;
	ping?: string;
	referrerpolicy?: string;
	rel?: string;
	target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
	type?: string;
}

export interface HtmlAreaAttributes extends HtmlGlobalAttributes {
	alt?: string;
	coords?: string;
	download?: string | boolean;
	href?: string;
	hreflang?: string;
	ping?: string;
	referrerpolicy?: string;
	rel?: string;
	shape?: "rect" | "circle" | "poly" | "default";
	target?: string;
}

export interface HtmlAudioAttributes extends HtmlMediaAttributes {}

export interface HtmlBaseAttributes extends HtmlGlobalAttributes {
	href?: string;
	target?: string;
}

export interface HtmlBlockquoteAttributes extends HtmlGlobalAttributes {
	cite?: string;
}

export interface HtmlButtonAttributes extends HtmlGlobalAttributes {
	disabled?: boolean;
	form?: string;
	formaction?: string;
	formenctype?: string;
	formmethod?: string;
	formnovalidate?: boolean;
	formtarget?: string;
	name?: string;
	popovertarget?: string;
	popovertargetaction?: "hide" | "show" | "toggle";
	type?: "submit" | "reset" | "button";
	value?: string;
}

export interface HtmlCanvasAttributes extends HtmlGlobalAttributes {
	height?: number | string;
	width?: number | string;
}

export interface HtmlColAttributes extends HtmlGlobalAttributes {
	span?: number | string;
}

export interface HtmlColgroupAttributes extends HtmlGlobalAttributes {
	span?: number | string;
}

export interface HtmlDataAttributes extends HtmlGlobalAttributes {
	value?: string;
}

export interface HtmlDelAttributes extends HtmlGlobalAttributes {
	cite?: string;
	datetime?: string;
}

export interface HtmlDetailsAttributes extends HtmlGlobalAttributes {
	name?: string;
	open?: boolean;
}

export interface HtmlDialogAttributes extends HtmlGlobalAttributes {
	open?: boolean;
}

export interface HtmlEmbedAttributes extends HtmlGlobalAttributes {
	height?: number | string;
	src?: string;
	type?: string;
	width?: number | string;
}

export interface HtmlFieldsetAttributes extends HtmlGlobalAttributes {
	disabled?: boolean;
	form?: string;
	name?: string;
}

export interface HtmlFormAttributes extends HtmlGlobalAttributes {
	"accept-charset"?: string;
	action?: string;
	autocomplete?: "on" | "off" | (string & {});
	enctype?:
		| "application/x-www-form-urlencoded"
		| "multipart/form-data"
		| "text/plain";
	method?: "get" | "post" | "dialog";
	name?: string;
	novalidate?: boolean;
	rel?: string;
	target?: string;
}

export interface HtmlHtmlAttributes extends HtmlGlobalAttributes {
	xmlns?: string;
}

export interface HtmlIframeAttributes extends HtmlGlobalAttributes {
	allow?: string;
	allowfullscreen?: boolean;
	height?: number | string;
	loading?: "eager" | "lazy";
	name?: string;
	referrerpolicy?: string;
	sandbox?: string;
	src?: string;
	srcdoc?: string;
	width?: number | string;
}

export interface HtmlImgAttributes extends HtmlGlobalAttributes {
	alt?: string;
	crossorigin?: "" | "anonymous" | "use-credentials";
	decoding?: "sync" | "async" | "auto";
	fetchpriority?: "high" | "low" | "auto";
	height?: number | string;
	ismap?: boolean;
	loading?: "eager" | "lazy";
	referrerpolicy?: string;
	sizes?: string;
	src?: string;
	srcset?: string;
	usemap?: string;
	width?: number | string;
}

export interface HtmlInputAttributes extends HtmlGlobalAttributes {
	accept?: string;
	alt?: string;
	autocomplete?: string;
	capture?: "user" | "environment" | boolean;
	checked?: boolean;
	dirname?: string;
	disabled?: boolean;
	form?: string;
	formaction?: string;
	formenctype?: string;
	formmethod?: string;
	formnovalidate?: boolean;
	formtarget?: string;
	height?: number | string;
	list?: string;
	max?: number | string;
	maxlength?: number | string;
	min?: number | string;
	minlength?: number | string;
	multiple?: boolean;
	name?: string;
	pattern?: string;
	placeholder?: string;
	readonly?: boolean;
	required?: boolean;
	size?: number | string;
	src?: string;
	step?: number | string;
	type?:
		| "button"
		| "checkbox"
		| "color"
		| "date"
		| "datetime-local"
		| "email"
		| "file"
		| "hidden"
		| "image"
		| "month"
		| "number"
		| "password"
		| "radio"
		| "range"
		| "reset"
		| "search"
		| "submit"
		| "tel"
		| "text"
		| "time"
		| "url"
		| "week"
		| (string & {});
	value?: string | number;
	width?: number | string;
}

export interface HtmlInsAttributes extends HtmlGlobalAttributes {
	cite?: string;
	datetime?: string;
}

export interface HtmlLabelAttributes extends HtmlGlobalAttributes {
	for?: string;
	htmlFor?: string;
}

export interface HtmlLiAttributes extends HtmlGlobalAttributes {
	value?: number | string;
}

export interface HtmlLinkAttributes extends HtmlGlobalAttributes {
	as?: string;
	crossorigin?: "" | "anonymous" | "use-credentials";
	disabled?: boolean;
	fetchpriority?: "high" | "low" | "auto";
	href?: string;
	hreflang?: string;
	imagesizes?: string;
	imagesrcset?: string;
	integrity?: string;
	media?: string;
	referrerpolicy?: string;
	rel?: string;
	sizes?: string;
	type?: string;
}

export interface HtmlMapAttributes extends HtmlGlobalAttributes {
	name?: string;
}

export interface HtmlMediaAttributes extends HtmlGlobalAttributes {
	autoplay?: boolean;
	controls?: boolean;
	crossorigin?: "" | "anonymous" | "use-credentials";
	loop?: boolean;
	muted?: boolean;
	preload?: "none" | "metadata" | "auto" | "";
	src?: string;
}

export interface HtmlMetaAttributes extends HtmlGlobalAttributes {
	charset?: string;
	content?: string;
	"http-equiv"?: string;
	media?: string;
	name?: string;
}

export interface HtmlMeterAttributes extends HtmlGlobalAttributes {
	form?: string;
	high?: number | string;
	low?: number | string;
	max?: number | string;
	min?: number | string;
	optimum?: number | string;
	value?: number | string;
}

export interface HtmlObjectAttributes extends HtmlGlobalAttributes {
	data?: string;
	form?: string;
	height?: number | string;
	name?: string;
	type?: string;
	width?: number | string;
}

export interface HtmlOlAttributes extends HtmlGlobalAttributes {
	reversed?: boolean;
	start?: number | string;
	type?: "1" | "a" | "A" | "i" | "I";
}

export interface HtmlOptgroupAttributes extends HtmlGlobalAttributes {
	disabled?: boolean;
	label?: string;
}

export interface HtmlOptionAttributes extends HtmlGlobalAttributes {
	disabled?: boolean;
	label?: string;
	selected?: boolean;
	value?: string;
}

export interface HtmlOutputAttributes extends HtmlGlobalAttributes {
	for?: string;
	form?: string;
	name?: string;
}

export interface HtmlProgressAttributes extends HtmlGlobalAttributes {
	max?: number | string;
	value?: number | string;
}

export interface HtmlQuoteAttributes extends HtmlGlobalAttributes {
	cite?: string;
}

export interface HtmlScriptAttributes extends HtmlGlobalAttributes {
	async?: boolean;
	crossorigin?: "" | "anonymous" | "use-credentials";
	defer?: boolean;
	fetchpriority?: "high" | "low" | "auto";
	integrity?: string;
	nomodule?: boolean;
	referrerpolicy?: string;
	src?: string;
	type?: string;
}

export interface HtmlSelectAttributes extends HtmlGlobalAttributes {
	autocomplete?: string;
	disabled?: boolean;
	form?: string;
	multiple?: boolean;
	name?: string;
	required?: boolean;
	size?: number | string;
}

export interface HtmlSlotAttributes extends HtmlGlobalAttributes {
	name?: string;
}

export interface HtmlSourceAttributes extends HtmlGlobalAttributes {
	height?: number | string;
	media?: string;
	sizes?: string;
	src?: string;
	srcset?: string;
	type?: string;
	width?: number | string;
}

export interface HtmlStyleAttributes extends HtmlGlobalAttributes {
	media?: string;
	nonce?: string;
}

export interface HtmlTableAttributes extends HtmlGlobalAttributes {
	align?: string;
}

export interface HtmlTdAttributes extends HtmlGlobalAttributes {
	colspan?: number | string;
	headers?: string;
	rowspan?: number | string;
}

export interface HtmlTemplateAttributes extends HtmlGlobalAttributes {
	shadowrootmode?: "open" | "closed";
}

export interface HtmlTextareaAttributes extends HtmlGlobalAttributes {
	autocomplete?: string;
	cols?: number | string;
	dirname?: string;
	disabled?: boolean;
	form?: string;
	maxlength?: number | string;
	minlength?: number | string;
	name?: string;
	placeholder?: string;
	readonly?: boolean;
	required?: boolean;
	rows?: number | string;
	wrap?: "hard" | "soft";
}

export interface HtmlThAttributes extends HtmlGlobalAttributes {
	abbr?: string;
	colspan?: number | string;
	headers?: string;
	rowspan?: number | string;
	scope?: "row" | "col" | "rowgroup" | "colgroup";
}

export interface HtmlTimeAttributes extends HtmlGlobalAttributes {
	datetime?: string;
}

export interface HtmlTrackAttributes extends HtmlGlobalAttributes {
	default?: boolean;
	kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
	label?: string;
	src?: string;
	srclang?: string;
}

export interface HtmlVideoAttributes extends HtmlMediaAttributes {
	disablepictureinpicture?: boolean;
	height?: number | string;
	playsinline?: boolean;
	poster?: string;
	width?: number | string;
}

// ---------------------------------------------------------------------------
// JSX namespace
// ---------------------------------------------------------------------------

export declare namespace JSX {
	type Element = string;
	type ElementType = string | ((props: any) => any);

	interface IntrinsicElements {
		a: HtmlAnchorAttributes;
		abbr: HtmlGlobalAttributes;
		address: HtmlGlobalAttributes;
		area: HtmlAreaAttributes;
		article: HtmlGlobalAttributes;
		aside: HtmlGlobalAttributes;
		audio: HtmlAudioAttributes;
		b: HtmlGlobalAttributes;
		base: HtmlBaseAttributes;
		bdi: HtmlGlobalAttributes;
		bdo: HtmlGlobalAttributes;
		blockquote: HtmlBlockquoteAttributes;
		body: HtmlGlobalAttributes;
		br: HtmlGlobalAttributes;
		button: HtmlButtonAttributes;
		canvas: HtmlCanvasAttributes;
		caption: HtmlGlobalAttributes;
		cite: HtmlGlobalAttributes;
		code: HtmlGlobalAttributes;
		col: HtmlColAttributes;
		colgroup: HtmlColgroupAttributes;
		data: HtmlDataAttributes;
		datalist: HtmlGlobalAttributes;
		dd: HtmlGlobalAttributes;
		del: HtmlDelAttributes;
		details: HtmlDetailsAttributes;
		dfn: HtmlGlobalAttributes;
		dialog: HtmlDialogAttributes;
		div: HtmlGlobalAttributes;
		dl: HtmlGlobalAttributes;
		dt: HtmlGlobalAttributes;
		em: HtmlGlobalAttributes;
		embed: HtmlEmbedAttributes;
		fieldset: HtmlFieldsetAttributes;
		figcaption: HtmlGlobalAttributes;
		figure: HtmlGlobalAttributes;
		footer: HtmlGlobalAttributes;
		form: HtmlFormAttributes;
		h1: HtmlGlobalAttributes;
		h2: HtmlGlobalAttributes;
		h3: HtmlGlobalAttributes;
		h4: HtmlGlobalAttributes;
		h5: HtmlGlobalAttributes;
		h6: HtmlGlobalAttributes;
		head: HtmlGlobalAttributes;
		header: HtmlGlobalAttributes;
		hgroup: HtmlGlobalAttributes;
		hr: HtmlGlobalAttributes;
		html: HtmlHtmlAttributes;
		i: HtmlGlobalAttributes;
		iframe: HtmlIframeAttributes;
		img: HtmlImgAttributes;
		input: HtmlInputAttributes;
		ins: HtmlInsAttributes;
		kbd: HtmlGlobalAttributes;
		label: HtmlLabelAttributes;
		legend: HtmlGlobalAttributes;
		li: HtmlLiAttributes;
		link: HtmlLinkAttributes;
		main: HtmlGlobalAttributes;
		map: HtmlMapAttributes;
		mark: HtmlGlobalAttributes;
		menu: HtmlGlobalAttributes;
		meta: HtmlMetaAttributes;
		meter: HtmlMeterAttributes;
		nav: HtmlGlobalAttributes;
		noscript: HtmlGlobalAttributes;
		object: HtmlObjectAttributes;
		ol: HtmlOlAttributes;
		optgroup: HtmlOptgroupAttributes;
		option: HtmlOptionAttributes;
		output: HtmlOutputAttributes;
		p: HtmlGlobalAttributes;
		picture: HtmlGlobalAttributes;
		pre: HtmlGlobalAttributes;
		progress: HtmlProgressAttributes;
		q: HtmlQuoteAttributes;
		rp: HtmlGlobalAttributes;
		rt: HtmlGlobalAttributes;
		ruby: HtmlGlobalAttributes;
		s: HtmlGlobalAttributes;
		samp: HtmlGlobalAttributes;
		script: HtmlScriptAttributes;
		search: HtmlGlobalAttributes;
		section: HtmlGlobalAttributes;
		select: HtmlSelectAttributes;
		slot: HtmlSlotAttributes;
		small: HtmlGlobalAttributes;
		source: HtmlSourceAttributes;
		span: HtmlGlobalAttributes;
		strong: HtmlGlobalAttributes;
		style: HtmlStyleAttributes;
		sub: HtmlGlobalAttributes;
		summary: HtmlGlobalAttributes;
		sup: HtmlGlobalAttributes;
		table: HtmlTableAttributes;
		tbody: HtmlGlobalAttributes;
		td: HtmlTdAttributes;
		template: HtmlTemplateAttributes;
		textarea: HtmlTextareaAttributes;
		tfoot: HtmlGlobalAttributes;
		th: HtmlThAttributes;
		thead: HtmlGlobalAttributes;
		time: HtmlTimeAttributes;
		title: HtmlGlobalAttributes;
		tr: HtmlGlobalAttributes;
		track: HtmlTrackAttributes;
		u: HtmlGlobalAttributes;
		ul: HtmlGlobalAttributes;
		var: HtmlGlobalAttributes;
		video: HtmlVideoAttributes;
		wbr: HtmlGlobalAttributes;

		// SVG elements (basic support)
		svg: HtmlGlobalAttributes & { [attr: string]: any };
		path: HtmlGlobalAttributes & { [attr: string]: any };
		circle: HtmlGlobalAttributes & { [attr: string]: any };
		rect: HtmlGlobalAttributes & { [attr: string]: any };
		line: HtmlGlobalAttributes & { [attr: string]: any };
		polyline: HtmlGlobalAttributes & { [attr: string]: any };
		polygon: HtmlGlobalAttributes & { [attr: string]: any };
		ellipse: HtmlGlobalAttributes & { [attr: string]: any };
		text: HtmlGlobalAttributes & { [attr: string]: any };
		g: HtmlGlobalAttributes & { [attr: string]: any };
		defs: HtmlGlobalAttributes & { [attr: string]: any };
		use: HtmlGlobalAttributes & { [attr: string]: any };
		image: HtmlGlobalAttributes & { [attr: string]: any };
		clipPath: HtmlGlobalAttributes & { [attr: string]: any };
		mask: HtmlGlobalAttributes & { [attr: string]: any };
		pattern: HtmlGlobalAttributes & { [attr: string]: any };
		linearGradient: HtmlGlobalAttributes & { [attr: string]: any };
		radialGradient: HtmlGlobalAttributes & { [attr: string]: any };
		stop: HtmlGlobalAttributes & { [attr: string]: any };
		symbol: HtmlGlobalAttributes & { [attr: string]: any };
		animate: HtmlGlobalAttributes & { [attr: string]: any };
		animateTransform: HtmlGlobalAttributes & { [attr: string]: any };
		foreignObject: HtmlGlobalAttributes & { [attr: string]: any };
	}

	interface ElementChildrenAttribute {
		children: {};
	}

	type IntrinsicAttributes = {};
}
