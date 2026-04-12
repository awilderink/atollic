export type Children =
	| string
	| number
	| bigint
	| boolean
	| null
	| undefined
	| Promise<Children>
	| Children[];

export type Component<T = Record<string, unknown>> = (
	props: T & { children?: Children },
) => string | Promise<string>;

// All WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
type AriaRole =
	| "alert"
	| "alertdialog"
	| "application"
	| "article"
	| "banner"
	| "button"
	| "cell"
	| "checkbox"
	| "columnheader"
	| "combobox"
	| "complementary"
	| "contentinfo"
	| "definition"
	| "dialog"
	| "directory"
	| "document"
	| "feed"
	| "figure"
	| "form"
	| "grid"
	| "gridcell"
	| "group"
	| "heading"
	| "img"
	| "link"
	| "list"
	| "listbox"
	| "listitem"
	| "log"
	| "main"
	| "marquee"
	| "math"
	| "menu"
	| "menubar"
	| "menuitem"
	| "menuitemcheckbox"
	| "menuitemradio"
	| "navigation"
	| "none"
	| "note"
	| "option"
	| "presentation"
	| "progressbar"
	| "radio"
	| "radiogroup"
	| "region"
	| "row"
	| "rowgroup"
	| "rowheader"
	| "scrollbar"
	| "search"
	| "searchbox"
	| "separator"
	| "slider"
	| "spinbutton"
	| "status"
	| "switch"
	| "tab"
	| "table"
	| "tablist"
	| "tabpanel"
	| "term"
	| "textbox"
	| "timer"
	| "toolbar"
	| "tooltip"
	| "tree"
	| "treegrid"
	| "treeitem"
	| (string & {});

declare global {
	namespace JSX {
		type Element = string | Promise<string>;
		// biome-ignore lint/suspicious/noExplicitAny: JSX ElementType is contravariant in props; must accept any component shape
		type ElementType = string | ((props: any) => any);

		// -------------------------------------------------------------------
		// Base HTML attributes (global attributes shared by all elements)
		// -------------------------------------------------------------------

		interface HtmlTag {
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
			role?: AriaRole;
			slot?: string;
			spellcheck?: "true" | "false" | boolean;
			style?: string;
			tabindex?: number | string;
			title?: string;
			translate?: "yes" | "no";

			// data-* and aria-*
			[attr: `data-${string}`]: string | number | boolean | undefined;
			[attr: `aria-${string}`]: string | number | boolean | undefined;

			// Event handlers (strings for server HTML, functions for universal components)
			// biome-ignore lint/suspicious/noExplicitAny: universal components pass framework-native handlers
			[attr: `on${string}`]: string | ((...args: any[]) => any) | undefined;

			// innerHTML support
			innerHTML?: string;
			dangerouslySetInnerHTML?: { __html: string };

			children?: Children;
		}

		// -------------------------------------------------------------------
		// Element-specific attributes
		// -------------------------------------------------------------------

		interface HtmlAnchorTag extends HtmlTag {
			download?: string | boolean;
			href?: string;
			hreflang?: string;
			ping?: string;
			referrerpolicy?: string;
			rel?: string;
			target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
			type?: string;
		}

		interface HtmlAreaTag extends HtmlTag {
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

		interface HtmlMediaTag extends HtmlTag {
			autoplay?: boolean;
			controls?: boolean;
			crossorigin?: "" | "anonymous" | "use-credentials";
			loop?: boolean;
			muted?: boolean;
			preload?: "none" | "metadata" | "auto" | "";
			src?: string;
		}

		interface HtmlAudioTag extends HtmlMediaTag {}

		interface HtmlBaseTag extends HtmlTag {
			href?: string;
			target?: string;
		}

		interface HtmlQuoteTag extends HtmlTag {
			cite?: string;
		}

		interface HtmlButtonTag extends HtmlTag {
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

		interface HtmlCanvasTag extends HtmlTag {
			height?: number | string;
			width?: number | string;
		}

		interface HtmlTableColTag extends HtmlTag {
			span?: number | string;
		}

		interface HtmlDataTag extends HtmlTag {
			value?: string;
		}

		interface HtmlModTag extends HtmlTag {
			cite?: string;
			datetime?: string;
		}

		interface HtmlDetailsTag extends HtmlTag {
			name?: string;
			open?: boolean;
		}

		interface HtmlDialogTag extends HtmlTag {
			open?: boolean;
		}

		interface HtmlEmbedTag extends HtmlTag {
			height?: number | string;
			src?: string;
			type?: string;
			width?: number | string;
		}

		interface HtmlFieldSetTag extends HtmlTag {
			disabled?: boolean;
			form?: string;
			name?: string;
		}

		interface HtmlFormTag extends HtmlTag {
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

		interface HtmlHtmlTag extends HtmlTag {
			xmlns?: string;
		}

		interface HtmlIFrameTag extends HtmlTag {
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

		interface HtmlImageTag extends HtmlTag {
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

		interface HtmlInputTag extends HtmlTag {
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

		interface HtmlLabelTag extends HtmlTag {
			for?: string;
			htmlFor?: string;
		}

		interface HtmlLITag extends HtmlTag {
			value?: number | string;
		}

		interface HtmlLinkTag extends HtmlTag {
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

		interface HtmlMapTag extends HtmlTag {
			name?: string;
		}

		interface HtmlMetaTag extends HtmlTag {
			charset?: string;
			content?: string;
			"http-equiv"?: string;
			media?: string;
			name?: string;
		}

		interface HtmlMeterTag extends HtmlTag {
			form?: string;
			high?: number | string;
			low?: number | string;
			max?: number | string;
			min?: number | string;
			optimum?: number | string;
			value?: number | string;
		}

		interface HtmlObjectTag extends HtmlTag {
			data?: string;
			form?: string;
			height?: number | string;
			name?: string;
			type?: string;
			width?: number | string;
		}

		interface HtmlOListTag extends HtmlTag {
			reversed?: boolean;
			start?: number | string;
			type?: "1" | "a" | "A" | "i" | "I";
		}

		interface HtmlOptgroupTag extends HtmlTag {
			disabled?: boolean;
			label?: string;
		}

		interface HtmlOptionTag extends HtmlTag {
			disabled?: boolean;
			label?: string;
			selected?: boolean;
			value?: string;
		}

		interface HtmlOutputTag extends HtmlTag {
			for?: string;
			form?: string;
			name?: string;
		}

		interface HtmlProgressTag extends HtmlTag {
			max?: number | string;
			value?: number | string;
		}

		interface HtmlScriptTag extends HtmlTag {
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

		interface HtmlSelectTag extends HtmlTag {
			autocomplete?: string;
			disabled?: boolean;
			form?: string;
			multiple?: boolean;
			name?: string;
			required?: boolean;
			size?: number | string;
		}

		interface HtmlSlotTag extends HtmlTag {
			name?: string;
		}

		interface HtmlSourceTag extends HtmlTag {
			height?: number | string;
			media?: string;
			sizes?: string;
			src?: string;
			srcset?: string;
			type?: string;
			width?: number | string;
		}

		interface HtmlStyleTag extends HtmlTag {
			media?: string;
			nonce?: string;
		}

		interface HtmlTableTag extends HtmlTag {
			align?: string;
		}

		interface HtmlTableSectionTag extends HtmlTag {}

		interface HtmlTableRowTag extends HtmlTag {}

		interface HtmlTableDataCellTag extends HtmlTag {
			colspan?: number | string;
			headers?: string;
			rowspan?: number | string;
		}

		interface HtmlTemplateTag extends HtmlTag {
			shadowrootmode?: "open" | "closed";
		}

		interface HtmlTextAreaTag extends HtmlTag {
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

		interface HtmlTableHeaderCellTag extends HtmlTag {
			abbr?: string;
			colspan?: number | string;
			headers?: string;
			rowspan?: number | string;
			scope?: "row" | "col" | "rowgroup" | "colgroup";
		}

		interface HtmlTimeTag extends HtmlTag {
			datetime?: string;
		}

		interface HtmlTrackTag extends HtmlTag {
			default?: boolean;
			kind?:
				| "subtitles"
				| "captions"
				| "descriptions"
				| "chapters"
				| "metadata";
			label?: string;
			src?: string;
			srclang?: string;
		}

		interface HtmlVideoTag extends HtmlMediaTag {
			disablepictureinpicture?: boolean;
			height?: number | string;
			playsinline?: boolean;
			poster?: string;
			width?: number | string;
		}

		interface HtmlSvgTag extends HtmlTag {
			[attr: string]: unknown;
		}

		// -------------------------------------------------------------------
		// Intrinsic elements
		// -------------------------------------------------------------------

		interface IntrinsicElements {
			a: HtmlAnchorTag;
			abbr: HtmlTag;
			address: HtmlTag;
			area: HtmlAreaTag;
			article: HtmlTag;
			aside: HtmlTag;
			audio: HtmlAudioTag;
			b: HtmlTag;
			base: HtmlBaseTag;
			bdi: HtmlTag;
			bdo: HtmlTag;
			blockquote: HtmlQuoteTag;
			body: HtmlTag;
			br: HtmlTag;
			button: HtmlButtonTag;
			canvas: HtmlCanvasTag;
			caption: HtmlTag;
			cite: HtmlTag;
			code: HtmlTag;
			col: HtmlTableColTag;
			colgroup: HtmlTableColTag;
			data: HtmlDataTag;
			datalist: HtmlTag;
			dd: HtmlTag;
			del: HtmlModTag;
			details: HtmlDetailsTag;
			dfn: HtmlTag;
			dialog: HtmlDialogTag;
			div: HtmlTag;
			dl: HtmlTag;
			dt: HtmlTag;
			em: HtmlTag;
			embed: HtmlEmbedTag;
			fieldset: HtmlFieldSetTag;
			figcaption: HtmlTag;
			figure: HtmlTag;
			footer: HtmlTag;
			form: HtmlFormTag;
			h1: HtmlTag;
			h2: HtmlTag;
			h3: HtmlTag;
			h4: HtmlTag;
			h5: HtmlTag;
			h6: HtmlTag;
			head: HtmlTag;
			header: HtmlTag;
			hgroup: HtmlTag;
			hr: HtmlTag;
			html: HtmlHtmlTag;
			i: HtmlTag;
			iframe: HtmlIFrameTag;
			img: HtmlImageTag;
			input: HtmlInputTag;
			ins: HtmlModTag;
			kbd: HtmlTag;
			label: HtmlLabelTag;
			legend: HtmlTag;
			li: HtmlLITag;
			link: HtmlLinkTag;
			main: HtmlTag;
			map: HtmlMapTag;
			mark: HtmlTag;
			menu: HtmlTag;
			meta: HtmlMetaTag;
			meter: HtmlMeterTag;
			nav: HtmlTag;
			noscript: HtmlTag;
			object: HtmlObjectTag;
			ol: HtmlOListTag;
			optgroup: HtmlOptgroupTag;
			option: HtmlOptionTag;
			output: HtmlOutputTag;
			p: HtmlTag;
			picture: HtmlTag;
			pre: HtmlTag;
			progress: HtmlProgressTag;
			q: HtmlQuoteTag;
			rp: HtmlTag;
			rt: HtmlTag;
			ruby: HtmlTag;
			s: HtmlTag;
			samp: HtmlTag;
			script: HtmlScriptTag;
			search: HtmlTag;
			section: HtmlTag;
			select: HtmlSelectTag;
			slot: HtmlSlotTag;
			small: HtmlTag;
			source: HtmlSourceTag;
			span: HtmlTag;
			strong: HtmlTag;
			style: HtmlStyleTag;
			sub: HtmlTag;
			summary: HtmlTag;
			sup: HtmlTag;
			table: HtmlTableTag;
			tbody: HtmlTableSectionTag;
			td: HtmlTableDataCellTag;
			template: HtmlTemplateTag;
			textarea: HtmlTextAreaTag;
			tfoot: HtmlTableSectionTag;
			th: HtmlTableHeaderCellTag;
			thead: HtmlTableSectionTag;
			time: HtmlTimeTag;
			title: HtmlTag;
			tr: HtmlTableRowTag;
			track: HtmlTrackTag;
			u: HtmlTag;
			ul: HtmlTag;
			var: HtmlTag;
			video: HtmlVideoTag;
			wbr: HtmlTag;

			// SVG elements
			svg: HtmlSvgTag;
			path: HtmlSvgTag;
			circle: HtmlSvgTag;
			rect: HtmlSvgTag;
			line: HtmlSvgTag;
			polyline: HtmlSvgTag;
			polygon: HtmlSvgTag;
			ellipse: HtmlSvgTag;
			text: HtmlSvgTag;
			g: HtmlSvgTag;
			defs: HtmlSvgTag;
			use: HtmlSvgTag;
			image: HtmlSvgTag;
			clipPath: HtmlSvgTag;
			mask: HtmlSvgTag;
			pattern: HtmlSvgTag;
			linearGradient: HtmlSvgTag;
			radialGradient: HtmlSvgTag;
			stop: HtmlSvgTag;
			symbol: HtmlSvgTag;
			animate: HtmlSvgTag;
			animateTransform: HtmlSvgTag;
			foreignObject: HtmlSvgTag;
			filter: HtmlSvgTag;
			feBlend: HtmlSvgTag;
			feColorMatrix: HtmlSvgTag;
			feComponentTransfer: HtmlSvgTag;
			feComposite: HtmlSvgTag;
			feConvolveMatrix: HtmlSvgTag;
			feDiffuseLighting: HtmlSvgTag;
			feDisplacementMap: HtmlSvgTag;
			feDistantLight: HtmlSvgTag;
			feDropShadow: HtmlSvgTag;
			feFlood: HtmlSvgTag;
			feFuncA: HtmlSvgTag;
			feFuncB: HtmlSvgTag;
			feFuncG: HtmlSvgTag;
			feFuncR: HtmlSvgTag;
			feGaussianBlur: HtmlSvgTag;
			feImage: HtmlSvgTag;
			feMerge: HtmlSvgTag;
			feMergeNode: HtmlSvgTag;
			feMorphology: HtmlSvgTag;
			feOffset: HtmlSvgTag;
			fePointLight: HtmlSvgTag;
			feSpecularLighting: HtmlSvgTag;
			feSpotLight: HtmlSvgTag;
			feTile: HtmlSvgTag;
			feTurbulence: HtmlSvgTag;
			marker: HtmlSvgTag;
			metadata: HtmlSvgTag;
			mpath: HtmlSvgTag;
			set: HtmlSvgTag;
			switch: HtmlSvgTag;
			textPath: HtmlSvgTag;
			tspan: HtmlSvgTag;
			view: HtmlSvgTag;
			desc: HtmlSvgTag;
			animateMotion: HtmlSvgTag;
		}

		interface ElementChildrenAttribute {
			children: unknown;
		}

		// Extension point for framework-level JSX attributes (e.g. `key`).
		// Empty by design — add well-known attributes via declaration merging.
		interface IntrinsicAttributes {
			key?: string | number;
		}

		type Component<T = Record<string, unknown>> = (
			props: T & { children?: Children },
		) => Element;
	}
}
