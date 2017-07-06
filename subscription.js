/**
 * A subscription that observes interactions to track resume and idle events.
 *
 * @class InteractionSubscription
 */
class InteractionSubscription {
  /**
   * Creates an instance of InteractionSubscription.
   *
   * @param {number} duration The amount of time, in miliseconds, for a period of time to
   *  be considered inactive.
   * @param {?Function} onActive A subscriber function that is called when activity resumes.
   * @param {?Function} onInactive A subscriber function that is called upon inactivity.
   * @memberof InteractionSubscription
   */
  constructor (duration, onActive, onInactive) {
    this.duration = duration;
    this.onActive = onActive;
    this.onInactive = onInactive;
  }

  /**
   * Called when there is a resume of activity after a period of inactivity.
   *
   * @memberof InteractionSubscription
   * @returns {void}
   */
  active() {
    if (this.onActive) {
      this.onActive();
    }
  }

  /**
   * Called when a threshold of inactivity is met.
   *
   * @memberof InteractionSubscription
   * @returns {void}
   */
  inactive() {
    if (this.onInactive) {
      this.onInactive();
    }
  }

  /**
   * Determines if an inactivity timer is running.
   *
   * @memberof InteractionSubscription
   * @returns {Boolean} If an inactivity timer is running.
   */
  isPending() {
    return !!this.timeout;
  }

  /**
   * Refreshes the inactivity timer.
   * When the timer completes, a period of inactivity has begin.
   *
   * @memberof InteractionSubscription
   * @returns {void}
   */
  refreshTimeout() {
    this.clearTimeout();

    this.timeout = setTimeout(() => {
      this.inactive();
      this.clearTimeout();
    }, this.duration);
  }

  /**
   * Clears the timer.
   *
   * @memberof InteractionSubscription
   * @returns {void}
   */
  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

export default InteractionSubscription
