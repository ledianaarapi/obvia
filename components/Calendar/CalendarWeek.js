/**
 * This is a CalendarWeek Component
 * 
 * Kreatx 2019
*/
import { CalendarBase } from "/obvia/components/Calendar/CalendarBase.js";
import { ObjectUtils } from "/obvia/lib/ObjectUtils.js";
import { ArrayUtils } from "/obvia/lib/ArrayUtils.js";
import { CalendarConstants } from "/obvia/components/Calendar/CalendarConstants.js";
var CalendarWeek = function(_props)
{
    let _self = this;
    let day;
    
    Object.defineProperty(this,"dataProvider",{
        get: function dataProvider(){ 
            return _dataProvider;
        },
        set: function dataProvider(v){
            if(_dataProvider !=v){
                _dataProvider = !ArrayEx.isArrayEx(v)? new ArrayEx(v):v;
            }
        }
    });

    this.afterAttach = function (e) {
        if (typeof _afterAttach == 'function')
            _afterAttach.apply(this, arguments);
        _creationFinished = true;
    };

    let _defaultParams = {
        dataProvider: [],
        type: ContainerType.NONE,
        labelField: 'label',
        labelFieldHour: 'label',        
        descriptionField: "description",
        interval: 30,
        duration: "",
        time: " ",
        startTime: " ",        
        endTime: " ",
        startHourCalendar: 0,
        endHourCalendar: 24,
        classField1: " ",
        heightField: "",
        css: { display: "flex" },
        cellHeight: 20,        
        eventsField: "cellEvents",
        internalFormat: "YYYY-MM-DD"
    };
    
    this.dates = function(today){
        let week = []; 
        today.setDate(today.getDate() - today.getDay() + 1);
        _self.calendarStartDate = new Date(today.getTime());
        for (let i = 0; i < 7; i++){
            week.push(new Date(today)); 
            today.setDate(today.getDate() +1);
        }
        return week; 
    };
    
    let _intervalToIndex = {};
    let _intervalFromDate = function (currentValue) {
        let date = dayjs(currentValue[_self.startDateTimeField], _self.inputFormat);
        let weekDayNumber = date.weekday();
        return date.week() + "-" + weekDayNumber;
    };

    let _prepareEvent = function (event) {
        let ds = dayjs(event[_self.startDateTimeField], _self.inputFormat);
        let de = dayjs(event[_self.endDateTimeField], _self.inputFormat);
        let d_ds = ds.toDate();
        let h = d_ds.getHours();
        let m = d_ds.getMinutes();
        let hm = (h + 1) * 60 + m + 1;
        _eventCount[hm] = _eventCount[hm] != null ? ++_eventCount[hm] : 0;
        event.valueHour = " ";
        event.duration = de.diff(ds, "minutes");
        event.top = _getTop(hm);
        event.height = _getHeight(event.duration);
        event.marginTop = _eventCount[hm] * 10;
        event.marginLeft = _eventCount[hm] * 10;
        return event;
    };

    let _eventCount = {};
            
    let _createDataProvider = function () {
        _eventCount = {};
        let groupedEvents = _self.calendarEvents.groupReduce(_intervalFromDate);
        let _dataProvider = [];
        let input = new Date(_self.nowDate.getTime());
        let result = _self.dates(input);
        let len = result.length;
        let wn = dayjs(_self.nowDate).week();
        for (let i = 0; i < len; i++) {
            let date_string = result[i].getDate();
            let day_string = CalendarConstants.Days[result[i].getDay()];
            let result_complete = day_string + " " + date_string;
            let mr = dayjs(result[i]);
            let dateContent = mr.format(_self.internalFormat);
            let gi = wn + "-"+ mr.weekday();
            let dp1 = {
                "value": result_complete,
                "dateContent": dateContent,
                "startTime": " ",
                "endTime": " ",
                "duration": "",
                "valueHour": " ",
                "top": " ",
                "height": " ",
                "marginTop": 0,
                "marginLeft": 0,
                "gi":gi
            };
            dp1[_eventsField] = new ArrayEx([]);
            dp1[_self.guidField] = StringUtils.guid();
            for (let j = 0; groupedEvents[gi] && j < groupedEvents[gi].length; j++) {
                _prepareEvent(groupedEvents[gi][j]);
            }
            if (groupedEvents[gi]) {
                dp1[_eventsField] = new ArrayEx(groupedEvents[gi]);
            }
            _dataProvider.push(dp1);
        }
        return _dataProvider;
    };    
    ObjectUtils.fromDefault(_defaultParams, _props);
    //_props = ObjectUtils.extend(false, false, _defaultParams, _props);
    let _cellHeight = _props.cellHeight;
    let _labelField = _props.labelField;
    let _labelFieldHour = _props._labelFieldHour;
    let _startTime = _props.startTime;
    let _duration = _props.duration;
    let _endTime = _props.endTime;
    let _interval = _props.interval;
    let _descriptionField = _props.descriptionField;
    let _time = _props.time;
    let  _timing = _props.timing;
    let  _valueHour = _props.valueHour;
    let _classFieldWeek = _props.classFieldWeek;
    let _height = _props.height;
    let _startHourCalendar = _props.startHourCalendar;
    let _endHourCalendar = _props.endHourCalendar;
    let _dataProvider ;
    let _dataProvider_Hour;
    let _eventsField = _props.eventsField;
    
    let _getTop = function(minutes){
        return (minutes*_cellHeight) / _interval;
    };

    this.addEvent = function (event) {
        let gi = _intervalFromDate(event);
        let ind = ArrayUtils.indexOfObject(_dataProvider, "gi", gi);
        
        if (ind > -1) {
            _prepareEvent(event);            
            _dataProvider[ind][_eventsField].splice(_dataProvider[ind][_eventsField].length, 0, event);
        }
        _self.calendarEvents.push(event);
    };
    
    let _getHeight = function(duration){
        let totalHeight =  Math.max(_cellHeight * duration/_interval, _cellHeight);
        return totalHeight;   
    };

    this.substract = function (time, minsToAdd) {
        let _displayHour = function (h) { return (h < 10 ? '0' : '') + h; };
        let split = time.split(':');
        let mins = split[0] * 60 + +split[1] + +minsToAdd;
        return _displayHour(mins % (24 * 60) / 60 | 0) + ':' + _displayHour(mins % 60);
    };

    let _repeater_for_week;
    let _repeater_for_hour;
    
    this.beforeAttach = function(e){
        
        if (e.target.id == this.domID){
            _repeater_for_week = this.cntRow.repeater_For_WeekDays_AND_Dates;
            _repeater_for_hour = this.cntRow.repeater_for_weekDays_and_dates;
            e.preventDefault();
        }
    };

    let initHourGrid = function(){
        let dataProvider_second = new ArrayEx();
        for (let j = _startHourCalendar; j < _endHourCalendar; j++) {
            let hours = j;
            hours = hours % 12;
            hours = hours ? hours : 0;
            let ampm = j >= 12 ? 'pm' : 'am';
            
            let arrayHours = new ArrayEx(_self.dataProvider.length * 2);
            for (let k = 0; k < _self.dataProvider.length; k++) {
                
                let dp1 = {
                    "value": " ",
                    "valueHour": k == 0 ? hours + ":00" : " ",
                    "startTime": hours + ":00" + " " + ampm,
                    "startTimeC": hours + ":00",
                    "duration": "",
                    "endTime": hours + ":" + _interval,
                    "interval": (hours + ":00") + "-" + (hours + ":" + _interval) + ampm,
                    "timing": ampm
                };
                dp1[_descriptionField] = "";
                dp1[_eventsField] = new ArrayEx([]);
                dp1[_self.guidField] = StringUtils.guid();
                arrayHours[k] = dp1;

                let dp2 = {
                    "value": " ",
                    "valueHour": " ",
                    "startTime": hours + ":" + _interval + "" + ampm,
                    "startTimeC": hours + ":" + _interval,
                    "duration": " ",
                    "classes": [],
                    "endTime": (hours + 1) + ':00',
                    "interval": (hours + ":" + _interval) + "-" + ((hours == 12) ? ((j % 12) + 1) : (hours + 1)) + ':00' + ampm
                };
                dp2[_descriptionField] = "";
                dp2[_eventsField] = new ArrayEx([]);
                dp2[_self.guidField] = StringUtils.guid();
                arrayHours[k + _self.dataProvider.length] = dp2;

            }
            dataProvider_second.splicea(dataProvider_second.length, 0, arrayHours);
        }
        return dataProvider_second; 
    };
    
    let initHourGrid_Prim = function(){
        let dataProvider_second = new ArrayEx();
        for (let j = 0; j < 24; j++)
        {
            let hours = j;
            hours = hours % 12;
            hours = hours ? hours : 12; // Hour: '0' -> '12'
            let ampm = j >=12 ? 'pm':'am';
        
    
            let dp1 = {
                "value": " ",
                "valueHour": hours + ":00",
                "startTime": hours + ":00" + " " + ampm,
                "startTimeC": hours + ":00",
                "duration": "",
                "endTime": hours + ":"+ _interval,
                "interval": (hours + ":00") + "-" + (hours + ":"+ _interval) + ampm,
                "timing": ampm
            };
            dp1[_descriptionField] = "";
            dp1[_eventsField] = new ArrayEx([]);
            dp1[_self.guidField] = StringUtils.guid();

            let dp2 = {
                "value": " ",
                "valueHour": " ",
                "startTime": hours + ":"+ _interval + "" + ampm,
                "startTimeC": hours + ":"+ _interval,
                "duration": " ",
                "classes": [],
                "endTime": (hours + 1) + ':00',
                "interval": (hours + ":"+ _interval ) + "-" + ((hours == 12) ? ((j % 12) + 1) : (hours + 1)) + ':00' + ampm
            };
            dp2[_descriptionField] = "";
            dp2[_eventsField] = new ArrayEx([]);
            dp2[_self.guidField] = StringUtils.guid();
            dataProvider_second.splicea(dataProvider_second.length, 0, [dp1, dp2]);                                                           
        }
        return dataProvider_second; 
    };
    
    this.previous = function () {
        let two_weeks_a = dayjs(_dataProvider[0].dateContent, _self.internalFormat).toDate();
        let two_weeks_ago = new Date(two_weeks_a.getTime() - 7 * 24 * 60 * 60 * 1000);
        _self.nowDate = two_weeks_ago;
        let new_dp_prev = _createDataProvider();
        let new_dp_prev_1 = new_dp_prev;
        let dp_first = _repeater_for_week.dataProvider;
        dp_first.splicea(0, dp_first.length, new_dp_prev_1);
        _self.dataProvider = new_dp_prev;
    };

    this.next = function () {        
        let one_week_n = dayjs(_dataProvider[0].dateContent, _self.internalFormat).toDate();
        let one_week_next = new Date(one_week_n.getTime() + 7 * 24 * 60 * 60 * 1000);
        _self.nowDate = one_week_next;
        let new_dp_next = _createDataProvider();
        let new_dp_next_1 = new_dp_next;
        let dp_first = _repeater_for_week.dataProvider;
        dp_first.splicea(0, dp_first.length, new_dp_next_1);
        _self.dataProvider = new_dp_next;
    };

    this.generateDay = function (ra) {
        let d = ra.currentIndex % 7;
        day = _self.dataProvider[d].value;
        console.log("day", day);
        return day;
    };

    this.convertHour = function (time) {
        let hours = parseInt(time.substr(0, 2));
        if (time.indexOf('am') != -1 && hours == 12) {
            time = time.replace('12', '00');
        }
        if (time.indexOf('pm') != -1 && hours < 12) {
            time = time.replace(hours, (hours + 12));
        }
        return time.replace(/(am|pm)/, '');


        // let ts = time;
        // let te = ts.split(' ')[1];
        // let H = +te.substr(0, 2);
        // let h = (H % 12) || 12;
        // h = (h < 10)?("0"+h):h;  // leading 0 at the left for 1 digit hours
        // let ampm = H < 12 ? " AM" : " PM";
        // te = h + te.substr(2, 3) + ampm;
        // return te;
        
    };
    
    let _calendarEventClick = function (e, ra) {
        let event = jQuery.Event("calendarEventClick");
        event.cell = this.parent;
        event.eventCell = this;
        event.originalEvent = e;
        _self.trigger(event, [ra]);
    };

    let _cellClick = function(e,ra) {       
        let event = jQuery.Event("cellClick");
        //Konvertimi i ores 12 ne 24 
        event.startTime = _self.convertHour(ra.currentItem.startTime);
        event.dateContent = _self.generateDay(ra);
        let date = (new Date(_self.calendarStartDate));
        date.setDate(_self.calendarStartDate.getDate() + (ra.currentIndex % 7));

        let arrtime = event.startTime.split(':');
        date.setHours(parseInt(arrtime[0], 10), parseInt(arrtime[1], 10), 0);
        event[_self.startDateTimeField] = date;
        event.cell = this;
        event.originalEvent = e;
        _self.trigger(event, [ra]);
    };
    
    let _cmps;
    let fnContainerDelayInit = function(){
        _cmps = [
            {
                ctor: Repeater,
                props: {
                    id: 'repeaterDayHour',
                    rendering: {
                        direction: "vertical",
                        separator: false,
                        wrap: false
                    },
                    classes: ["fc-float"],
                    dataProvider: _dataProvider_Hour_Prim,
                    css: {"margin-top":"60px", "margin-right":"40px"},
                    components: [
                        {
                            ctor: Container,
                            props: {
                                type: ContainerType.NONE,
                                id: "pass_value_hour",
                                label: '{' + _valueHour + '}',
                                classes: ["fc-container-label-hour"],
                                height: 20,
                                width: 20
                            }
                        }
                    ]
                }
            },
            {
                ctor: Container,
                props: {
                    id: 'cntRow',
                    type: ContainerType.NONE,
                    components: [
                        {
                            ctor: Repeater,
                            props: {
                                ownerDocument: _self.ownerDocument,
                                id: "repeater_For_WeekDays_AND_Dates",
                                type: ContainerType.NONE,
                                rendering: {
                                    direction: "horizontal",
                                    separator: false,
                                    wrap: false
                                },
                                css: {display: "flex"},
                                dataProvider: _dataProvider,
                                components: [
                                    {
                                        ctor: Container,
                                        props: {
                                            type: Container.NONE,
                                            id: "Container_Week_Days",
                                            height: 40,
                                            width: 150,
                                            label: '{' + _labelField + '}',
                                            classes: '{' + _classFieldWeek + '}',
                                            classes: ['fc-week-display'],
                                            components: [
                                                {
                                                    ctor: Repeater,
                                                    props: {
                                                        id: "repeater_top",
                                                        dataProvider: "{" + _eventsField + "}",
                                                        rendering: {
                                                            direction: "vertical",
                                                            separator: false,
                                                            wrap: false
                                                        },
                                                        classes: ["fc-repeater-top"],
                                                        components: [
                                                            {
                                                                ctor: Container,
                                                                props: {
                                                                    type: ContainerType.NONE,
                                                                    top: "{top}",
                                                                    height: "{height}",
                                                                    marginTop: "{marginTop}",
                                                                    marginLeft: "{marginLeft}",
                                                                    id: "Container_top",
                                                                    label: "{" + _descriptionField + "}",
                                                                    classes: ["fc-event-first"],
                                                                    "click": _calendarEventClick
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            ctor: Repeater,
                            props: {
                                id: 'repeaterDayHour',
                                type: ContainerType.NONE,
                                rendering: {
                                    direction: "horizontal",
                                    separator: false,
                                    wrap: false
                                },
                                classes: ["fc-float"],
                                dataProvider: _dataProvider_Hour,
                                components: [
                                    {
                                        ctor: Container,
                                        props: {
                                            type: ContainerType.NONE,
                                            id: "container_hour_display",
                                            classes: ["fc-hour"],
                                            height: _cellHeight,
                                            width: 150,
                                            components: [
                                            ],
                                            "click": _cellClick,
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ];
    };   
    
    let r = CalendarBase.call(this, _props);
    
    let _rPromise;
    this.render = function () 
    {  
        this.$container = this.$el;
        _rPromise = new Promise((resolve, reject) => {
            _self.on("endDraw", function(e){
                if (e.target.id == _self.domID) 
                {
                    resolve(r); 
                }
            });                   
        });

        _dataProvider = _createDataProvider();
        _dataProvider_Hour = initHourGrid();
        _dataProvider_Hour_Prim = initHourGrid_Prim();
        fnContainerDelayInit(); 
        this.addComponents(_cmps);
        return _rPromise;
    }; 
    
    return r;
}
CalendarWeek.prototype.ctor = 'CalendarWeek';
export {
    CalendarWeek
};