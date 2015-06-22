/*global module*/
"use strict";
var React = require('react/addons');
var AnimateMixin = require('react-animate');

var handlers = {
    ease(easing){
        return (typeof(easing) == "object" && easing.apply && easing.remove) ?
            {
                applyEasing : easing.apply,
                removeEasing : easing.remove
            } : {
                applyEasing : easing,
                removeEasing : easing
            };
    }
}

function merge(a, b){
    return React.addons.update(a, {$merge: b})
}

var IsoAnimateMixin = {
    mixins: [AnimateMixin],
    getInitialState(){
        return { __isoAnimateMixin: {} }
    },
    setIsoAnimeState(state) {
        this.setState({ __isoAnimateMixin: merge(this.state.__isoAnimateMixin, state)});
    },
    isoAnimeState(key) {
        return key ? this.state.__isoAnimateMixin[key] : this.state.__isoAnimateMixin;
    },
    reverseCountDownTick(name){
        var state = this.isoAnimeState(name);
        if(state && state.reverseCountDown > 0)
            this.setIsoAnimeState({ [ name ]: merge(state, {reverseCountDown: state.reverseCountDown-1}) });
    },
    defineIsoAnimation({name, easing, from, to, duration, callbacks, loop = false, removeMultiplier = 1, series}){
        var self = this;
        self.setIsoAnimeState({ [name]: {removeMultiplier: removeMultiplier, loop: loop}});
        var {applyEasing, removeEasing} = handlers.ease(easing);
        var applyFunc = name + 'Apply';
        var removeFunc = name + 'Remove';
        var functions = {
            removeLogic(currentStyle, looping){
                self.animate(
                    removeFunc, // animation name
                    currentStyle || to,
                    from, // final style
                    duration / removeMultiplier, // animation duration (in ms)
                    { 
                        easing: removeEasing,
                        onTick: function(){if(looping) self.reverseCountDownTick(name)},
                        onComplete: function(currentStyle){
                            if (looping){
                                functions.apply(looping);
                            } else if (self.isoAnimeState(name) && (self.isoAnimeState(name).reversed !== undefined)){
                                self.setIsoAnimeState({ [ name ]: {reversed: undefined} });
                            }
                        }
                    } // other options
                );

                if(looping)
                    self.setIsoAnimeState({ [ name ]: {looping: true, reversed: true, reverseCountDown: 2} });
            },
            apply(looping){
                var currentStyle = self.getAnimatedStyle(removeFunc);
                self.animate(
                    applyFunc, // animation name
                    currentStyle != {} ? currentStyle : from,
                    to,
                    duration, // animation duration (in ms)
                    { 
                        easing: applyEasing,
                        onTick: function(){ if(looping) self.reverseCountDownTick(name) },
                        onAbort: function(currentStyle){
                            functions.removeLogic(currentStyle);
                        },
                        onComplete: function(currentStyle){
                            if (loop){
                                functions.removeLogic(currentStyle, true);
                            }
                        }
                    } // other options
                );

                if(looping)
                    self.setIsoAnimeState({ [ name ]: {looping: true, reversed: false, reverseCountDown: 2} });

                if (callbacks && callbacks.apply)
                    callbacks.apply();
            },
            remove(){
                if(!self.abortAnimation(applyFunc)){
                    functions.removeLogic();
                }
                if (callbacks && callbacks.remove)
                    callbacks.remove();
            }
        }
        return functions
    },
    isoAnimeLoopLogic(name){
        var state = this.isoAnimeState(name);
        // have to wait for two counts before the animation is applied.
        // This could be fixed in a better way - react-animate keeps track of animation ticks anyways
        var style = ((state.reversed && state.reverseCountDown == 0) || (!state.reversed && state.reverseCountDown > 0)) ?
            this.getAnimatedStyle(name + 'Remove') :
            this.getAnimatedStyle(name + 'Apply');

        return style;
    },
    getAnimation(componentTriggerBool, name){
        if (componentTriggerBool && this.isoAnimeState(name) && this.isoAnimeState(name).reversed !== undefined){
            return this.isoAnimeLoopLogic(name);
        } else {
             return componentTriggerBool ? this.getAnimatedStyle(name + 'Apply') : this.getAnimatedStyle(name + 'Remove');
        }
    },
    addAnimationStyle(style, componentTriggerBool, name){
        return merge(style, this.getAnimation(componentTriggerBool, name))
    }
};

module.exports = IsoAnimateMixin;
