/**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Q42
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as Lint from 'tslint';
import * as ts from 'typescript';
import {
	isIdentifier,
	isJsxAttribute,
	isJsxElement,
	isJsxExpression,
	isJsxSelfClosingElement,
} from 'tsutils/typeguard/3.0';

export class Rule extends Lint.Rules.AbstractRule {
	public static metadata: Lint.IRuleMetadata = {
		ruleName: 'tsx-a11y-touchables',
		description: Lint.Utils.dedent`Warn if a touchable component misses accessible properties.`,
		options: null,
		optionsDescription: 'Not configurable.',
		type: 'functionality',
		typescriptOnly: false,
	};

	public static FAILURE_STRING_ACCESSIBLE = 'Touchable component misses accessible property.';
	public static FAILURE_STRING_ACCESSIBILITYLABEL =
		'Touchable and accessible component misses accessibilityLabel property.';
	public static FAILURE_STRING_ACCESSIBILITYROLE =
		'Touchable and accessible component misses accessibilityRole property.';

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
		return this.applyWithFunction(sourceFile, walk);
	}
}

function walk(ctx: Lint.WalkContext<void>): void {
	return ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
		if (isJsxElement(node) && isTouchableComponent(node.openingElement.tagName)) {
			assertAccessibilityProperties(ctx, node, node.openingElement.attributes);
		}

		if (isJsxSelfClosingElement(node) && isTouchableComponent(node.tagName)) {
			assertAccessibilityProperties(ctx, node, node.attributes);
		}

		return ts.forEachChild(node, cb);
	});
}

function isTouchableComponent(tagName: ts.JsxTagNameExpression) {
	return (
		isIdentifier(tagName) &&
		tagName.escapedText
			.toString()
			.toLowerCase()
			.startsWith('touchable')
	);
}

const propsToCheck = ['accessible', 'accessibilityLabel', 'accessibilityRole'];

function assertAccessibilityProperties(
	ctx: Lint.WalkContext<void>,
	node: ts.Node,
	attributes: ts.JsxAttributes
) {
	const props: ts.JsxAttribute[] = attributes.properties.filter(
		prop => isJsxAttribute(prop) && propsToCheck.some(s => s === prop.name.text)
	) as ts.JsxAttribute[];

	/**
	 * Assert accessible property
	 */
	const accessibleAttribute = props.find(prop => prop.name.text === 'accessible');
	if (
		!accessibleAttribute ||
		!accessibleAttribute.initializer ||
		!isJsxExpression(accessibleAttribute.initializer)
	) {
		return ctx.addFailureAtNode(node, Rule.FAILURE_STRING_ACCESSIBLE);
	}
	const { expression } = accessibleAttribute.initializer;
	const isValueFalse = expression !== undefined && expression.kind === ts.SyntaxKind.FalseKeyword;

	if (isValueFalse) {
		return;
	}
	/**
	 * Assert accessibilityLabel property
	 */
	if (!props.some(prop => prop.name.text === 'accessibilityLabel')) {
		ctx.addFailureAtNode(node, Rule.FAILURE_STRING_ACCESSIBILITYLABEL);
	}
	/**
	 * Assert accessibilityLabel property
	 */
	if (!props.some(prop => prop.name.text === 'accessibilityRole')) {
		ctx.addFailureAtNode(node, Rule.FAILURE_STRING_ACCESSIBILITYROLE);
	}
}
