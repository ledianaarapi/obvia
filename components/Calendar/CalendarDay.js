/**
 * This is a CalendarDay Component
 * 
 * Kreatx 2019
*/
import { CalendarBase } from "/obvia/components/Calendar/CalendarBase.js";
import { ObjectUtils } from "/obvia/lib/ObjectUtils.js";
import { ArrayUtils } from "/obvia/lib/ArrayUtils.js";
import { CalendarConstants } from "/obvia/components/Calendar/CalendarConstants.js";

var CalendarDay = function(_props)
{
    let _self = this;
    let _lbl;

    let _dpWatcher;
    let _dpLengthChanged = function (e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    let _dpMemberChanged = function (e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        _dataProvider[_intervalToIndex[_intervalFromDate(e.newValue)]][_eventsField].splice(_dataProvider[_intervalToIndex[_intervalFromDate(e.newValue)]][_eventsField].length, 0, e.newValue);
    };

    this.afterAttach = function (e) {
        if (typeof _afterAttach == 'function')
            _afterAttach.apply(this, arguments);
        _creationFinished = true;
    };

    let _defaultParams = {
        dataProvider: [],
        labelField: 'label',
        labelField1: 'label',
        startTime: " ",
        endTime: " ",        
        startHourCalendar: 0,
        endHourCalendar: 24,
        interval: 30,
        eventsField: "cellEvents",
        guidField: "guid",
        inputFormat: 'YYYY-MM-DD HH:mm',
        outputFormat: 'YYYY-MM-DD HH:mm',
        internalFormat: "YYYY-MM-DD"
    };

    let _intervalToIndex = {};
    let _intervalFromDate = function (currentValue) {
        let m = dayjs(currentValue[_self.startDateTimeField], _self.inputFormat);
        let hours = m.hours();
        let minutes = m.minutes();
        let h = hours % 12;
        h = h ? h : 12;
        let ampm = hours >= 12 ? 'pm' : 'am';
        if (minutes == _interval) {
            return m.format(_self.internalFormat)+" "+(h + ":" + _interval) + "-" + ((h == 12) ? ((hours % 12) + 1) : (h + 1)) + ':00' + ampm;
        }
        else {
            return  m.format(_self.internalFormat)+" "+(h + ":00") + "-" + (h + ":" + _interval) + ampm;
        }
    };
    
    let _createHours = function () {
        let groupedEvents = _self.calendarEvents.groupReduce(_intervalFromDate);
        let _dataProvider = [];
        let dateContent = dayjs(_self.nowDate).format(_self.internalFormat);
        for (let i = _startHourCalendar; i < _endHourCalendar; i++) {
            let hours = i;
            hours = hours % 12;
            hours = hours ? hours : 0;
            let ampm = i >= 12 ? 'pm' : 'am';
            
            let dp1 = {
                "value": hours + ":00",
                "startTime": hours + ":00",
                "endTime": hours + ":" + _interval,
                "timeInterval": (hours + ":00") + "-" + (hours + ":" + _interval) + ampm,
                "dateContent": dateContent
            };

            dp1[_eventsField] = new ArrayEx([]);
            dp1[_guidField] = StringUtils.guid();
            let hourInterval_2 = dateContent + " " + dp1.timeInterval;
            dp1["dateTime"] = hourInterval_2;
            
            if (hourInterval_2 in groupedEvents) {
                dp1[_eventsField] = new ArrayEx(groupedEvents[hourInterval_2]);
            }
            _intervalToIndex[hourInterval_2] = _dataProvider.push(dp1) - 1;

            let dp2 = {
                "value": " ",
                "startTime": hours + ":" + _interval,
                "endTime": (hours + 1) + ":00",
                "timeInterval": (hours + ":" + _interval) + "-" + ((hours == 12) ? ((i % 12) + 1) : (hours + 1)) + ':00' + ampm,
                "timing": ampm,
                "dateContent": dateContent
            };

            dp2[_eventsField] = new ArrayEx([]);
            dp2[_guidField] = StringUtils.guid();
            let hourInterval_3 = dateContent + " " + dp2.timeInterval;
            dp2["dateTime"] = hourInterval_3;
            if (hourInterval_3 in groupedEvents) {
                dp2[_eventsField] = new ArrayEx(groupedEvents[hourInterval_3]);
            }

            _intervalToIndex[hourInterval_3] = _dataProvider.push(dp2) - 1;
        }
        return _dataProvider;
    };

    ObjectUtils.fromDefault(_defaultParams, _props);
    //_props = ObjectUtils.extend(false,false,_defaultParams,_props);
    let _guidField = _props.guidField;
    let _labelField = _props.labelField;
    let _labelField1 = _props.labelField1;
    let _startTime = _props.startTime;
    let _endTime = _props.endTime;
    let _interval = _props.interval;
    let  _dataProvider; 
    let _eventsField = _props.eventsField;
    let _startHourCalendar = _props.startHourCalendar;
    let _endHourCalendar = _props.endHourCalendar;

    this.addEvent = function (event) {
        let gi = _intervalFromDate(event);
        let ind = ArrayUtils.indexOfObject(_dataProvider, "dateTime", gi);
        if(ind > -1) {
            _dataProvider[ind][_eventsField].splice(_dataProvider[ind][_eventsField].length, 0, event);
        }
        _self.calendarEvents.push(event);
    };        
    
    let _repeater_hour;
    this.beginDraw = function (e) {
        if (e.target.id == this.domID) {
            
        }
    };
    
    this.beforeAttach = function (e) {
        if (e.target.id == this.domID) {
            _repeater_hour = this.Container_Repeater.repeaterForHours;
            _lbl = this.Label_Displaying_WeekDay;
            e.preventDefault();
        }
    };

    this.previous = function (eve) {
        _self.nowDate.setDate(_self.nowDate.getDate() - 1);
        let new_prev = CalendarConstants.Days[_self.nowDate.getDay()];
        let update_prev_date = _self.nowDate.getDate();
        let new_dp_prev = _createHours();
        let dataProvider = _repeater_hour.dataProvider;
        dataProvider.splicea(0, dataProvider.length, new_dp_prev);
        _lbl.label = new_prev + " " + update_prev_date;
        _self.dataProvider = new_dp_prev;
    };

    this.next = function (eve) {
        _self.nowDate.setDate(_self.nowDate.getDate() + 1);
        let new_day = CalendarConstants.Days[_self.nowDate.getDay()];
        let update_date = _self.nowDate.getDate();
        let new_dp_next = _createHours();
        let dp = _repeater_hour.dataProvider;
        dp.splicea(0, dp.length, new_dp_next);
        _lbl.label = new_day + " " + update_date;
        _self.dataProvider = new_dp_next;
    };
    
    let _calendarEventClick = function (e, ra) {
        let event = jQuery.Event("calendarEventClick");
        event.cell = this.parent;
        event.eventCell = this;
        event.originalEvent = e;
        _self.trigger(event, [ra]);
    };

    let _cellClick = function (e, ra) {
        let event = jQuery.Event("cellClick");
        event.startTime = ra.currentItem.startTime;
        let arrtime = ra.currentItem.startTime.split(':');
        let date = new Date(_self.nowDate.getTime());
        date.setHours(parseInt(arrtime[0]), parseInt(arrtime[1]), 0);
        event[_self.startDateTimeField] = date;
        event.cell = this;
        event.originalEvent = e;
        _self.trigger(event, [ra]);
    };

    let  _cmps;
    let fnContainerDelayInit = function () {
        _cmps = [
            {
                ctor: Label,
                props: {
                    id: 'Label_Displaying_WeekDay',
                    ownerDocument: _self.ownerDocument,
                    label: CalendarConstants.Days[_self.nowDate.getDay()] + " " + _self.nowDate.getDate(),
                    classes: ["fc-week-day"],
                }
            },
            {
                ctor: Container,
                props: {
                    type: ContainerType.NONE,
                    id: "Container_Repeater",
                    ownerDocument: _self.ownerDocument,
                    classes: ["fc-float"],
                    components: [
                        {
                            ctor: Repeater,
                            props: {
                                id: 'repeaterForHours',
                                rendering: {
                                    direction: "horizontal",
                                    separator: false
                                },
                                classes: ["fc-float"],
                                dataProvider: _dataProvider,
                                components: [
                                    {
                                        ctor: Container,
                                        props: {
                                            type: ContainerType.NONE,
                                            id: "InContainerForHours",
                                            label: '{' + _labelField + '}',
                                            classes: ["fc-container-hour"],
                                            height: 20,
                                            width: 20,
                                        }
                                    },
                                    {
                                        ctor: Container,
                                        props: {
                                            type: ContainerType.NONE,
                                            id: "container_for_both",
                                            components: [{
                                                ctor: Container,
                                                props: {
                                                    type: ContainerType.NONE,
                                                    id: "container_half_1",
                                                    label: "{timeInterval}",
                                                    classes: ["fc-hour-day"],
                                                    height: 10,
                                                    width: 1050,
                                                }
                                            },
                                            {
                                                ctor: Repeater,
                                                props: {
                                                    id: "event_Repeater",
                                                    dataProvider: "{" + _eventsField + "}",
                                                    rendering: {
                                                        direction: "horizontal",
                                                        separator: false
                                                    },
                                                    components: [{
                                                        ctor: Container,
                                                        props: {
                                                            type: ContainerType.NONE,
                                                            id: "event_Container",
                                                            label: "{" + _self.descriptionField + "}",
                                                            classes: ["fc-event"],
                                                            "click": _calendarEventClick
                                                        }
                                                    }]
                                                }
                                            }],
                                            "click": _cellClick,
                                        }
                                    }
                                ]
                            }
                        },
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
        _dataProvider = _createHours();
        fnContainerDelayInit();
        this.addComponents(_cmps);
        return _rPromise;
    };

    return r;
}
CalendarDay.prototype.ctor = 'CalendarDay';
export {
    CalendarDay
};