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
  onActive={() => console.log('User no longer idle')}
  onInactive={() => console.log('User is idle, dismiss the screen or something')}
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

## Roadmap

`context` support for registering specific inactivity rules and callbacks:

```js
componentDidMount() {
  this.sub = this.context.interactionProvider.register(10 * 1000, this.onActive, this.onInactive)
}

componentWillUnmount() {
  this.sub.remove()
}

onActive() {
  console.log('user is active')
}

onInactive() {
  console.log('user is inactive after 10s')
}
```
