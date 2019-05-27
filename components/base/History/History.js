//persist in cache :) 

var History = function(_props)
{ 
    this.$el = $(this);
    var _defaultParams = {
        cacheProps: {enabled:false, cachedVariableName: null}
    };

    _props = extend(false, false, _defaultParams, _props);
    var _cacheProps = _props.cacheProps;
    if(_cacheProps.enabled)
	{
        _cache = Cache.getInstance();
    }
    var _behaviors;
    var _steps = new ArrayEx();
    var _currentIndex = -1;

    var w = ChangeWatcher.getInstance(_steps);
    w.watch(_steps, "length", function(e){
        //e.oldValue e.newValue
        console.log("qweeqweqw");
    });

    Object.defineProperty(this, "behaviors", {
        get: function behaviors()
        {
            return _behaviors;
        },
        set: function behaviors(b)
        {
            _behaviors = b;
        }
    });

    Object.defineProperty(this, "currentIndex", {
        get: function currentIndex()
        {
            return _currentIndex;
        }
    });

    Object.defineProperty(this, "steps", {
        get: function steps()
        {
            return _steps;
        }
    });

    this.track = function(behaviorName, ret, thisObj, args){
        if(_behaviors)
        {
            var behavior = _behaviors[behaviorName];
            if(behavior.undo && typeof behavior.undo == 'function' && ((isObject(ret) && ret.track) || ret)){
                var step = new HistoryStep();
                step.behaviorName = behaviorName; 
                
                if(isObject(ret)){
                    step.description = ret.description || behavior.description;
                    step.stepType = ret.stepType || behavior.stepType;
                }
                step.thisObj = thisObj;
                step.args = args;
                if(_steps.length>0 && _currentIndex<_steps.length-1)
                {
                    //ketu ne currentIndex < length beji splice nga currentIndex e deri ne length
                    _steps.splice(Math.max(_currentIndex,0), _steps.length - Math.max(_currentIndex,0)- 1 );
                }
                _steps.push(step);
                ++_currentIndex;
            }
        }else{
            console.log("You need to initialize behaviors first.");
        }
    }

    this.redo = function(){
        if(_steps.length > 0 && _currentIndex+1 >= 0 && _currentIndex < _steps.length-1)
        {
            ++_currentIndex;
            var step = _steps[_currentIndex];
            var behavior = _behaviors[step.behaviorName];
            if(behavior.do && typeof behavior.do == 'function'){
                behavior.do.apply(step.thisObj, step.args);
            }
        }else{
            console.log("Nothing to redo.");
            var eventObject = $.Event(HistoryEventType.HISTORY_NO_MORE_REDO);
            this.trigger(eventObject);
        }
    }

    this.undo = function(){
        if(_steps.length > 0 && _currentIndex>=0 && _currentIndex <= _steps.length-1)
        {
            var step = _steps[_currentIndex];
            var behavior = _behaviors[step.behaviorName];
            if(behavior.undo && typeof behavior.undo == 'function'){
                behavior.undo.apply(step.thisObj, step.args);
            }
            --_currentIndex;
        }else{
            console.log("Nothing to undo.");
            var eventObject = $.Event(HistoryEventType.HISTORY_NO_MORE_UNDO);
            this.trigger(eventObject);
        }
    }
}

History.instances = {};
History.getInstance = function(instName)
{
    var instance = History.instances[instName];
    if(!instance)
        instance = History.instances[instName] = new History();
    return instance;
}     
History.prototype = Object.create(EventDispatcher.prototype);