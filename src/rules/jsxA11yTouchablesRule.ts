/**
 * @license
 * Copyright 2019 Q42 Internet B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
