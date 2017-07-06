import React, {PropTypes} from 'react';
import InteractionProvider from './interactionProvider';

/**
 * A behavioral wrapper that decorates a child component with interaction detections.
 * This is helpful to determine whether or not a user is interacting with the application.
 * After a period of inactivity, `onInactive` will be fired, letting you know the application has idled.
 *
 * Examples:
 * ```
 * <InteractionContainer onInactive={() => navigator.pop()}>
 * 	<YourScreen />
 * </InteractionContainer>
 * ```
 *
 * ```
 * <InteractionContainer onInactive={() => alert('button hasnt been pressed in a while')}>
 *   <Button>If you dont click me, I will know</Button>
 * </InteractionContainer>
 * ```
 */
class InteractionContainer extends React.Component {
  static propTypes = {
    timeout: PropTypes.number, // timeout in milliseconds
    onActive: PropTypes.func.isRequired,
    onInactive: PropTypes.func.isRequired // called when the timer has completed
  };

  static defaultProps = {
    timeout: 60 * 1000 // 1m
  };

  static contextTypes = {
    interactionProvider: React.PropTypes.object.isRequired
  };

  componentDidMount() {
    this.subscription = this.context.interactionProvider.subscribe(
      this.props.timeout,
      this.props.onActive,
      this.props.onInactive
    );
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  render() {
    const {
      timeout,
      onActive,
      onInactive,
      children,
      ...props
    } = this.props;

    const child = React.Children.only(children);
    return React.cloneElement(child, props);
  }
}

export default class WrappedInteractionContainer extends React.Component {
  render() {
    return (
      <InteractionProvider>
        <InteractionContainer {...this.props} />
      </InteractionProvider>
    );
  }
}
