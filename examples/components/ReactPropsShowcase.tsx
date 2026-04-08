/** @jsxImportSource react */
"use client";

export default function ReactPropsShowcase(props: {
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
		<dl
			style={{
				padding: "1rem",
				border: "1px solid #ccc",
				borderRadius: "8px",
				fontSize: "0.875rem",
			}}
		>
			<dt>plain-string</dt>
			<dd>
				<span data-testid="react-prop-plain-string">{props.plainString}</span>
			</dd>

			<dt>html-string</dt>
			<dd>
				<span data-testid="react-prop-html-string">{props.htmlString}</span>
			</dd>

			<dt>xss-string</dt>
			<dd>
				<span data-testid="react-prop-xss-string">{props.xssString}</span>
			</dd>

			<dt>int</dt>
			<dd>
				<span data-testid="react-prop-int">{props.int}</span>
			</dd>

			<dt>float</dt>
			<dd>
				<span data-testid="react-prop-float">{props.float}</span>
			</dd>

			<dt>negative</dt>
			<dd>
				<span data-testid="react-prop-negative">{props.negative}</span>
			</dd>

			<dt>zero</dt>
			<dd>
				<span data-testid="react-prop-zero">{props.zero}</span>
			</dd>

			<dt>bool-true</dt>
			<dd>
				<span data-testid="react-prop-bool-true">{String(props.boolTrue)}</span>
			</dd>

			<dt>bool-false</dt>
			<dd>
				<span data-testid="react-prop-bool-false">
					{String(props.boolFalse)}
				</span>
			</dd>

			<dt>null-val</dt>
			<dd>
				<span data-testid="react-prop-null-val">{String(props.nullVal)}</span>
			</dd>

			<dt>str-array</dt>
			<dd>
				<span data-testid="react-prop-str-array">
					{props.strArray.join(",")}
				</span>
			</dd>

			<dt>nested-obj</dt>
			<dd>
				<span data-testid="react-prop-nested-obj">
					{props.nestedObj.outer.inner}
				</span>
			</dd>
		</dl>
	);
}
