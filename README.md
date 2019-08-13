# TSLint React Native Accessibility rules
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

TSLint rules to enhance accessibility in React Native apps. [TSLint](https://github.com/palantir/tslint/).

### Usage



```js
{
  "extends": ["tslint:latest", "tslint-react-native-a11y"],
  "rules": {
    // override tslint-react-native-a11y rules here
  }
}
```

### Rules

- `jsx-a11y-touchable`
  - Enforces you to set either `accessible={false}` or set `accessible={true}` with `accessibilityRole={}` and `accessibilityLabel={}` as well.
