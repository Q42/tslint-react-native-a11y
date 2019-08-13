# TSLint React Native Accessibility rules
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![npm version](https://badge.fury.io/js/%40q42%2Ftslint-react-native-a11y.svg)](https://badge.fury.io/js/%40q42%2Ftslint-react-native-a11y)

TSLint rules to enhance accessibility in React Native apps. [TSLint](https://github.com/palantir/tslint/).

### Usage



```js
{
  "extends": ["tslint:latest", "@q42/tslint-react-native-a11y"],
  "rules": {
    // override tslint-react-native-a11y rules here
  }
}
```

### Rules

- `tsx-a11y-touchables`
  - Enforces you to set either `accessible={false}` or set `accessible={true}` with `accessibilityRole={}` and `accessibilityLabel={}` as well.
