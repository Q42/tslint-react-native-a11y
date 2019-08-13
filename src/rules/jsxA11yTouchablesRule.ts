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
	isJsxSelfClosingElement,
	isJsxSpreadAttribute,
	isObjectLiteralExpression,
} from 'tsutils/typeguard/3.0';

export class Rule extends Lint.Rules.AbstractRule {
	public static metadata: Lint.IRuleMetadata = {
		ruleName: 'accessible-touchable',
		description: Lint.Utils.dedent`Warn if a touchable component misses an accessibility property.`,
		options: null,
		optionsDescription: '',
		optionExamples: ['true'],
		type: 'functionality',
		typescriptOnly: false,
	};

	public static FAILURE_STRING =
		'Touchable component misses an accessible / accessibilityLabel attribute.';

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
		return this.applyWithFunction(sourceFile, walk);
	}
}

function walk(ctx: Lint.WalkContext<void>): void {
	return ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
		if (isJsxElement(node) || isJsxSelfClosingElement(node)) {
			checkElement(node, ctx);
		}
		return ts.forEachChild(node, cb);
	});
}

function checkElement(node: ts.Node, ctx: Lint.WalkContext<void>) {
	if (
		isJsxElement(node) &&
		isTouchableComponent(node.openingElement.tagName) &&
		!hasAccessibilityAttributes(node.openingElement.attributes) &&
		!hasAccessibilityAttributesSpread(node.openingElement.attributes)
	) {
		ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
	}

	if (
		isJsxSelfClosingElement(node) &&
		isTouchableComponent(node.tagName) &&
		!hasAccessibilityAttributes(node.attributes) &&
		!hasAccessibilityAttributesSpread(node.attributes)
	) {
		ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
	}
}

function isTouchableComponent(tagName: ts.JsxTagNameExpression) {
	return isIdentifier(tagName) && tagName.escapedText.toString().startsWith('Touchable');
}

function hasAccessibilityAttributes(attributes: ts.JsxAttributes) {
	return (
		attributes.properties
			.map(prop => isJsxAttribute(prop) && prop.name.text === 'accessibilityLabel')
			.indexOf(true) !== -1
	);
}

function hasAccessibilityAttributesSpread(attributes: ts.JsxAttributes) {
	return attributes.properties.some(
		prop =>
			isJsxSpreadAttribute(prop) &&
			isObjectLiteralExpression(prop.expression) &&
			prop.expression.properties.some(
				expProp =>
					expProp.name !== undefined &&
					isIdentifier(expProp.name) &&
					expProp.name.text === 'accessibilityLabel'
			)
	);
}
