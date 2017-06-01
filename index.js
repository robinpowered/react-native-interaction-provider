import React, {PropTypes} from 'react';
import {PanResponder} from 'react-native';


/**
 * A behavioral wrapper that decorates a child component with interaction detections.
 * This is helpful to determine whether or not a user is interacting with the application.
 * After a period of inactivity, `onInactive` will be fired, letting you know the application has idled.
 *
 * <InteractionContainer onInactive={() => navigator.pop()}>
 * 	<YourScreen />
 * </InteractionContainer>
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

  constructor(props) {
    super(props);
    this.inactiveTimer = null;
  }

  /**
   * Create the dismiss timer and initialize the PanResponders when the component mounts.
   *
   * @returns {void}
   */
  componentWillMount() {
    this.panResponder = PanResponder.create({
      // don't respond to gestures
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,

      // don't capture, but when permission to capture is requested, refresh the timer
      onStartShouldSetPanResponderCapture: () => this.onPanResponderCapture(),
      onMoveShouldSetPanResponderCapture: () => this.onPanResponderCapture()
    });
  }

  /**
   * Clear the timer when the component dismounts
   *
   * @return {void}
   */
  componentWillUnmount() {
    this.stopInactiveTimer();
  }

  /**
   * Refresh the timer when the PanResponder requests to capture a gesture.
   *
   * @return {Boolean} `false` to prevent capturing the gesture.
   */
  onPanResponderCapture () {
    if (!this.inactiveTimer && this.props.onActive) {
      this.props.onActive();
    }

    this.refreshInactiveTimer();
    return false;
  }

  /**
   * Starts the dismiss timeout.
   *
   * @return {void}
   */
  startInactiveTimer() {
    this.inactiveTimer = setTimeout(() => {
      this.props.onInactive();
      this.inactiveTimer = null;
    }, this.props.timeout);
  }

  /**
   * Stops the dismiss timeout.
   *
   * @return {void}
   */
  stopInactiveTimer() {
    clearTimeout(this.inactiveTimer);
    this.inactiveTimer = null;
  }

  /**
   * Refreshes the dismiss timer
   *
   * @returns {void}.
   */
  refreshInactiveTimer() {
    this.stopInactiveTimer();
    this.startInactiveTimer();
  }

  /**
   * Decorate the child node with the pan handlers.
   *
   * @return {Object} The decorated React element.
   */
  render() {
    return React.cloneElement(this.props.children, {
      ...this.panResponder.panHandlers
    });
  }
}

export default InteractionContainer;
