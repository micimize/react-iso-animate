# react-iso-animate
An extension of [react-animate][] for creating isomorphic (easily reversable) animations based on a given state.

API:
`defineIsoAnimtaion`: returns an object with apply and remove functions for the defined animation. options:
```
    {name, easing, from, to, duration, callbacks, loop = false, removeMultiplier = 1}
```
`name`, `easing`, `from`, `to`, and `duration` are all used by [react-animate][]. Easing can optionally be a hash of the form `{apply: easing, remove: easing}`. `from` and `to` are hashes of the styles to animate to and from while applying (reversed while removing).
`callbacks` is an optional argument of the form `{apply: fn, remove: fn}`.
`loop` will alternate between `.apply()` and `.remove()` until the component removes the animation.
`removeMultiplier` optionally multiplies the removal animation speed.

Then in the `render` phase of the component, call `this.getAnimation(componentTriggerBool, name)` to get the current animation hash, or `addAnimationStyle(style, componentTriggerBool, name)` to add it to existing styles

example:
```
var style = {
    display: 'inline-block',
    position: 'fixed',
    top: 5,
    height: 'auto',
    width: '5em'
};
var Hello = React.createClass({
    mixins: [IsoAnimationMixin],
    getInitialState() {
        return { hover: false };
    },
    onMouseEnter(ev) {
        this.setState({ hover: true });
    },
    onMouseLeave(ev) {
        this.setState({ hover: false });
    }
    componentWillMount(){ 
        var self = this;
        self.pop = self.defineIsoAnimation({
            name: 'pop',
            from: { width: '5em' }, // initial style
            to: { width: '8.2em' }, // final style
            duration: 1000,
            easing: 'bounce',
            callbacks: {
                apply: self.onMouseEnter,
                remove: self.onMouseLeave
            }
        });
    },
    render() {
        var hover = this.state.hover;
        return (
            <div style={this.addAnimationStyle(style, hover, 'pop')}
                onMouseEnter={this.pop.apply} onMouseLeave={this.pop.remove}>
                Hello world
            </div>
        );
    }
});
```

[react-animate]: https://github.com/elierotenberg/react-animate
