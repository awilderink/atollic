/** @jsxImportSource solid-js */
"use client";

export default function SolidPropsShowcase(props: {
	plainString: string;
	htmlString: string;
	xssString: string;
	int: number;
	float: number;
	negative: number;
	zero: number;
	boolTrue: boolean;
	boolFalse: boolean;
	nullVal: null;
	strArray: string[];
	nestedObj: { outer: { inner: string } };
}) {
	return (
		<dl style={{ padding: "1rem", border: "1px solid #ccc", "border-radius": "8px", "font-size": "0.875rem" }}>
			<dt>plain-string</dt>
			<dd><span data-testid="solid-prop-plain-string">{props.plainString}</span></dd>

			<dt>html-string</dt>
			<dd><span data-testid="solid-prop-html-string">{props.htmlString}</span></dd>

			<dt>xss-string</dt>
			<dd><span data-testid="solid-prop-xss-string">{props.xssString}</span></dd>

			<dt>int</dt>
			<dd><span data-testid="solid-prop-int">{props.int}</span></dd>

			<dt>float</dt>
			<dd><span data-testid="solid-prop-float">{props.float}</span></dd>

			<dt>negative</dt>
			<dd><span data-testid="solid-prop-negative">{props.negative}</span></dd>

			<dt>zero</dt>
			<dd><span data-testid="solid-prop-zero">{props.zero}</span></dd>

			<dt>bool-true</dt>
			<dd><span data-testid="solid-prop-bool-true">{String(props.boolTrue)}</span></dd>

			<dt>bool-false</dt>
			<dd><span data-testid="solid-prop-bool-false">{String(props.boolFalse)}</span></dd>

			<dt>null-val</dt>
			<dd><span data-testid="solid-prop-null-val">{String(props.nullVal)}</span></dd>

			<dt>str-array</dt>
			<dd><span data-testid="solid-prop-str-array">{props.strArray.join(",")}</span></dd>

			<dt>nested-obj</dt>
			<dd><span data-testid="solid-prop-nested-obj">{props.nestedObj.outer.inner}</span></dd>
		</dl>
	);
}
