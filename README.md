# react-native-interaction-provider

A behavioral component wrapper detecting user interactions, and letting you know when the application has idled.

## Installation

```
$ npm install react-native-interaction-provider --save
```

## Usage

```js
import InteractionProvider from 'react-native-interaction-provider'

<InteractionProvider
  timeout={60 * 1000} // idle after 1m
  onInactive={() => this.props.dismiss()}
>
  <YourScreen />
</InteractionProvider>
```

### Important Note

`InteractionProvider` uses the `PanResponder` to detect gestures. It will apply the `PanHandlers` to the component that it wraps. The wrapped component must apply the provided props to its root `View`.

Example:

```js
class YourScreen extends React.Component {
  render() {
    const {
      props,
      you,
      care,
      about,
      ...rest
    } = this.props;
    return (
      <View
        {...rest} // `panHandlers` will be provided here
      >
        ...
      </View>
    );
  }
}
```
