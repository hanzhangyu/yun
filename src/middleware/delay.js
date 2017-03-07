/**
 * Created by Paul on 2017/2/27.
 */
export default (store) => (next) => (action) => {
    if (!action.meta || !action.meta.delay) {
        return next(action);
    }
    let intervalId = setTimeout(() => next(action), action.meta.delay);
    return function cancel() {
        clearInterval(intervalId);
    };
};