import React from 'react';
import PropTypes from 'prop-types';
import {PanResponder} from 'react-native';
import InteractionSubscription from './subscription';

/**
 * A provider component exposing a subscribable context allowing components to observe changes in inactivity
 * by observing interaction gestures with the child component.
 *
 * Example usage:
 *
 * ```
 * componentWillMount() {
 *   this.subscription = this.context.interactionProvider.subscribeForInactivity(duration, this.onInactive)
 * }
 *
 * componentWillUnmount() {
 *   this.subscription.remove()
 * }
 * ```
 */
class InteractionProvider extends React.Component {
  static childContextTypes = {
    interactionProvider: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.subscriptions = [];

    this.subscribe = this.subscribe.bind(this);
    this.subscribeForActivity = this.subscribeForActivity.bind(this);
    this.subscribeForInactivity = this.subscribeForInactivity.bind(this);
  }

  getChildContext() {
    return {
      interactionProvider: {
        subscribe: this.subscribe,
        subscribeForActivity: this.subscribeForActivity,
        subscribeForInactivity: this.subscribeForInactivity
      }
    };
  }

  /**
   * Creates an interaction subscription that will observe periods of inactivity and when inactivity becomes resumed.
   *
   * @memberof InteractionContainer
   * @param {number} duration The amount of time, in miliseconds, after which the interaction is considered inactive.
   * @param {?Function} onActive A subscriber function that is called when activity resumes.
   * @param {?Function} onInactive A subscriber function that is called upon inactivity.
   * @returns {Object} The subscription API.
   */
  subscribe(duration, onActive, onInactive) {
    var subscription = new InteractionSubscription(duration, onActive, onInactive);
    this.subscriptions.push(subscription);
    subscription.refreshTimeout();

    // The public API of the subscription.
    return {
      /**
       * Removes the subscription.
       *
       * @returns {void}
       */
      remove: () => {
        var index = this.subscriptions.indexOf(subscription);
        subscription.clearTimeout();
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }
      }
    };
  }

  /**
   * Creates an interaction subscription that will observe periods of inactivity.
   *
   * @memberof InteractionContainer
   * @param {number} duration The amount of time, in miliseconds, after which the interaction is considered inactive.
   * @param {Function} onInactive A subscriber function that is called upon inactivity.
   * @returns {Object} The subscription API.
   */
  subscribeForInactivity(duration, onInactive) {
    return this.subscribe(duration, null, onInactive);
  }

  /**
   * Creates an interaction subscription that will observe when a period of inactivity beomes active again.
   *
   * @memberof InteractionContainer
   * @param {number} duration The amount of time, in miliseconds, after which the interaction is considered inactive.
   * @param {Function} onActive A subscriber function that is called when activity resumes.
   * @returns {Object} The subscription API.
   */
  subscribeForActivity(duration, onActive) {
    return this.subscribe(duration, onActive, null);
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
    this.subscriptions.forEach(subscription => {
      if (!subscription.isPending()) {
        subscription.active();
      }
      subscription.refreshTimeout();
    });

    return false;
  }

  /**
   * Starts the dismiss timeout.
   *
   * @return {void}
   */
  startInactiveTimer() {
    this.refreshInactiveTimer();
  }

  /**
   * Stops the dismiss timeout.
   *
   * @return {void}
   */
  stopInactiveTimer() {
    this.subscriptions.forEach(subscription => subscription.clearTimeout());
  }

  /**
   * Refreshes the dismiss timer
   *
   * @returns {void}.
   */
  refreshInactiveTimer() {
    this.subscriptions.forEach(subscription => subscription.refreshTimeout());
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

export default InteractionProvider;
