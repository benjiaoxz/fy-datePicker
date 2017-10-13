/**
 * Created by benjiaoxz on 2017/6/20.
 * code: https://coding.net/u/benjiaoxz/p/fy-datePicker/git
 * pages: http://benjiaoxz.coding.me/fy-datePicker/examples/index.html
 *
 */

(function(_) {
    /*
    * 检测js库
    *
    *   库只能是Zepto或jQuery，建议使用Zepto
    *
    * */
    try {
        _.$ = $;
    } catch (e) {
        throw 'js库必须为Zepto或jQuery';
    }

    /*
     * 默认参数
     *
     * 	初始化年月日：dateBase，默认为当日
     * 	gather：数据集合
     * 	    格式：[{date: '2017-6-20', comment: '备注', state: 'select'}...]
     * 	    param：
     * 	        date：日期，必填，
     * 	        comment：备注信息
     * 	        state：状态，可选（select）、只读（readonly）、禁用（disable）、已选（active），默认可选
     * 	disableSwitch：关闭切换月份，默认false
     * 	lock：锁定控件上的所有操作，只展示，默认false
     * 	多选：multiple，默认true
     * 	初始化的当日之前是否可选：before，默认不可选
     * 	当前月份的后续月份可选数：after，
     * 	    必须为数字，
     * 	    默认后两个月，负数则是前月
     * 	周末是否可选：weekend，默认不可选
     * 	选择事件回调：selectCallback
     * 	是否高亮显示含有备注信息的元素：highlight，默认显示
     *
     * */
    var DEFAULT = {
        dateBase: '',
        gather: [],
        disableSwitch: false,
        lock: false,
        multiple: true,
        before: false,
        after: 2,
        weekend: false,
        selectCallback: null,
        highlight: true
    };

    var DatePicker = function (element, opt) {
        /*
         * 返回数据
         *
         * 	base：初始日期（year：年，month：月，day：日，week：星期）
         * 	selectData：选中的数据，数组
         *
         * */
        DatePicker.data = {
            base: {
                year: '',
                month: '',
                day: '',
                week: ''
            },
            selectData: []
        };

        //元素
        if(element) {
            DatePicker.el = $(element);
        } else {
            DatePicker.el = $(this);
        }

        //继承
        if(typeof opt === 'object') {
            //备注
            if(opt.gather) {
                if(typeof opt.gather == 'object' && !(opt.gather instanceof Array)) {
                    opt.gather = [opt.gather];
                }
            }

            $.extend(DEFAULT, opt);
        }

        DatePicker.init.call(this);
    };

    //初始化
    DatePicker.init = function () {
        //默认年月日：如果没有传入特指时间，则已执行的时间为初始化
        if(DEFAULT.dateBase !== '') {
            var tody = DatePicker.formatDate(DEFAULT.dateBase);
        } else {
            var now = new Date();
            var tody = {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
            }
        }

        DatePicker.data.base = {
            year: tody.year,
            month: tody.month,
            day: tody.day,
            week: tody.week
        };

        //initBase：初始日期
        var initBase = DatePicker.data.base;

        this.full(initBase);
    }

    //填充数据
    DatePicker.prototype.full = function (date) {
        //参数处理
        if(typeof date == 'string') {
            var DATE = DatePicker.formatDate(date);
        } else if(typeof date == 'object') {
            var DATE = date;
        } else {
            throw '参数错误';
        }

        /*
         * 创建元素
         *
         * 	$parent：盒子，
         * 	$head：头部（存储初始化年月和上下月的控制器）
         * 	$section：内容（存储初始月的所有天数，包括天数和备注）
         *
         * */
        var $parent = $('<div class="fy-date-picker">');

        var $head = $('<div class="head">');

        if(DEFAULT.dateBase == '') {
            //没有传入初始日期
            var leftBtnDisable = 'disabled',
                rightBtnDisable = 'disabled';
            var leftTarget = '',
                rightTarget = '';
        } else {
            var baseDate = DatePicker.formatDate(DEFAULT.dateBase),
                baseMonth = baseDate.month,
                baseDay = baseDate.day;

            /*
             *
             * 月份
             *
             * */
            //上个月
            if(DATE.month == 1) {
                //一月
                var beforeMonth = (DATE.year - 1) + '-12';
            } else if(DATE.month - 1 == baseMonth) {
                //如果是初始化月
                var beforeMonth = DATE.year + '-' + baseMonth + '-' + baseDay;
            } else {
                //其他月
                var beforeMonth = DATE.year + '-' + (DATE.month - 1);
            }

            //下个月
            if(DATE.month == 12) {
                //十二月
                var afterMonth = (DATE.year + 1) + '-1';
            } else if(DATE.month + 1 == baseMonth) {
                //如果是初始化月
                var afterMonth = DATE.year + '-' + baseMonth + '-' + baseDay;
            } else {
                //其他月
                var afterMonth = DATE.year + '-' + (DATE.month + 1);
            }

            var leftBtnDisable = '',
                rightBtnDisable = '';
            var leftTarget = 'data-target-month="' + beforeMonth + '"',
                rightTarget = 'data-target-month="' + afterMonth + '"';

            if(typeof DEFAULT.after == 'number') {
                if(DEFAULT.after < 0) {
                    //小于0
                    if(DATE.month - 1 < baseMonth + DEFAULT.after) {
                        leftBtnDisable = 'disabled';
                        leftTarget = '';
                    } else if(DATE.month + 1 > baseMonth) {
                        rightBtnDisable = 'disabled';
                        rightTarget = '';
                    }
                } else if(DEFAULT.after > 0) {
                    //大于0
                    if(DATE.month - 1 < baseMonth) {
                        leftBtnDisable = 'disabled';
                        leftTarget = '';
                    } else if(DATE.month > baseMonth + (DEFAULT.after - 1)) {
                        rightBtnDisable = 'disabled';
                        rightTarget = '';
                    }
                } else {
                    //=0
                    leftBtnDisable = 'disabled';
                    leftTarget = '';
                    rightBtnDisable = 'disabled';
                    rightTarget = '';
                }
            }
        }

        /*
        * 上下月份切换
        *
        *   param:
        *       disableSwitch：是否禁用
        *
        * */
        var _leftBtn = '',
            _rightBth = '';
        if(!DEFAULT.disableSwitch) {
            _leftBtn += '<div class="left-btn ' + leftBtnDisable + '" ' + leftTarget + '>上个月</div>';
            _rightBth += '<div class="right-btn ' + rightBtnDisable + '" ' + rightTarget + '>下个月</div>';
        }

        var _headHTML = _leftBtn + '<div class="date">' + DATE.year + '年' + DATE.month + '月</div>' + _rightBth;

        //disableSwitch

        //填充头部到盒子里
        $parent.append($head.append(_headHTML));

        //section
        var $section = $('<table cellspacing="0" border="0" class="section">');

        $section.append('<thead>' +
            '<tr>' +
            '<th>日</th>' +
            '<th>一</th>' +
            '<th>二</th>' +
            '<th>三</th>' +
            '<th>四</th>' +
            '<th>五</th>' +
            '<th>六</th>' +
            '</tr>' +
            '</thead>');

        var $body = $('<tbody></tbody>');
        var _bodyHTML = '';

        //获取月的第一天
        var firstDay = new Date(DATE.year, DATE.month - 1, 1),
            firstDayWeek = firstDay.getDay();

        //获取月的最大天数
        var lastDay = new Date(DATE.year, DATE.month, 0),
            lastDayDate = lastDay.getDate(),
            lastDayWeek = lastDay.getDay();

        var dayArr = [];

        //将月份所有日转成数组
        for(var i = 1; i <= lastDayDate; i++) {
            dayArr.push(i);
        }

        //如果第一天不是星期日
        if(firstDayWeek !== 0) {
            for(var i = 0; i < firstDayWeek; i++) {
                dayArr.unshift('');
            }
        }

        //如果最后一天不是星期六
        if(lastDayWeek !== 6) {
            for(var i = 0; i < 6 - lastDayWeek; i++) {
                dayArr.push('');
            }
        }

        //备注信息处理：获取当月所有备注
        var commentArr = [];
        for(var i = 0;i < DEFAULT.gather.length; i++) {
            if(DEFAULT.gather[i].comment) {
                commentArr.push({date: DEFAULT.gather[i].date, text: DEFAULT.gather[i].comment})
            }
        }

        var _comment = DatePicker.formatComment(DATE.year + '-' + DATE.month, commentArr);

        //循环填充
        /*
         *
         * param
         *
         * 	statusClass：状态样式，
         * 	statusConfirm：选择状态，
         * 	selectable：可选的，
         * 	dateData：日期，年月日
         * 	dateHtml：日期，年月日
         *  	commentData：备注信息
         *  	commentHtml：备注信息
         *
         *  	tdHTML：td
         *  	ckDay：检查备注信息
         *
         * */
        var statusClass = '',
            statusConfirm = '',
            selectable = '',
            dateData = '',
            dateHtml = '',
            commentData = '',
            commentHtml = '';

        var tdHTML = '',
            ckDay = '',
            saturday = '',
            sunday = '';

        /*
        *
        * 处理状态
        *
        *   param：
        *       stateSelect：可选
        *       stateReadonly：只读
        *       stateDisable：禁用
        *       stateActive：已选
        *
        * */
        var stateSelect = [],
            stateReadonly = [],
            stateDisable = [],
            stateActive = [];
        var stateTmp = null;

        for(var i = 0; i < DEFAULT.gather.length; i++) {
            if(DEFAULT.gather[i].state) {
                stateTmp = {date: DEFAULT.gather[i].date, comment: DEFAULT.gather[i].comment};

                switch (DEFAULT.gather[i].state) {
                    case 'select':
                        //可选
                        stateSelect.push(stateTmp);
                        break;
                    case 'readonly':
                        //只读
                        stateReadonly.push(stateTmp);
                        break;
                    case 'disable':
                        //禁用
                        stateDisable.push(stateTmp);
                        break;
                    case 'active':
                        //已选
                        stateActive.push(stateTmp);

                        //如果已选数据之前没有添加到选择数组中，则添加
                        if(DatePicker.data.selectData.indexOf(stateTmp) < 0) {
                            DatePicker.data.selectData.push(stateTmp);
                        }

                        break;
                }
            }
        }

        for(var i = 0; i < dayArr.length; i++) {
            ckDay = checkComment(dayArr[i]);
            saturday = i % 7 == 0;
            sunday = (i + 1) % 7 == 0;

            //日期数据和备注信息
            dateData = 'data-date="' + DATE.year + '-' + DATE.month + '-' + dayArr[i] + '" ';
            dateHtml = '<p>' + dayArr[i] + '</p>';
            commentData = 'data-comment="' + ckDay + '"';
            commentHtml = '<span class="comment">' + ckDay + '</span>';
            statusClass = '';
            statusConfirm = '';
            selectable = '';

            if(dayArr[i] == '') {
                dateData = '';
                dateHtml = '';
                commentData = '';
                commentHtml = '';
                statusClass = '';
                statusConfirm = '';
                selectable = '';
            } else {
                //今日之前是否可选
                if(!DEFAULT.before) {
                    if(dayArr[i] < DATE.day) {
                        //不可选
                        statusClass = ' readonly';
                        statusConfirm = '';
                        selectable = '';
                    }
                }

                //周末
                if(!DEFAULT.weekend) {
                    if(saturday || sunday) {
                        //忽略周末的样式
                        statusClass = ' disabled';
                    }
                }

                var newDate = DATE.year + '-' + DATE.month + '-' + dayArr[i];

                if(checkDate(newDate, stateSelect)) {
                    //可选
                    statusClass = '';
                    statusConfirm = 'data-confirm="false" ';
                    selectable = 'data-selectable="true" ';
                } else if(checkDate(newDate, stateActive)) {
                    //已选
                    statusClass = ' active';
                    statusConfirm = 'data-confirm="true" ';
                    selectable = 'data-selectable="true" ';
                } else {
                    //不可选
                    statusConfirm = '';
                    selectable = '';

                    if(checkDate(newDate, stateDisable)) {
                        //禁用
                        statusClass = ' disabled';
                    } else if(checkDate(newDate, stateReadonly)) {
                        //只读
                        statusClass = ' readonly';
                    }
                }
            }

            //如果当日已被选中过
            if(dayArr[i] != '') {
                if(checkDate(DATE.year + '-' + DATE.month + '-' + dayArr[i], DatePicker.data.selectData)) {
                    statusClass = ' active';
                    statusConfirm = 'data-confirm="true" ';
                    selectable = 'data-selectable="true" ';
                }
            }

            //如果含有备注信息，则高亮显示
            if(DEFAULT.highlight) {
                if($.trim(ckDay) != '') {
                    statusClass += ' highlight';
                }
            }

            //td
            statusClass = $.trim(statusClass);
            tdHTML += '<td class="' + statusClass + '" ' +
                statusConfirm +
                selectable +
                dateData +
                commentData +
                '>' +
                dateHtml +
                commentHtml +
                '</td>';
        }

        //合并数据
        _bodyHTML += '<tr>' + tdHTML + '</tr>';

        /*
         *
         * 查询当日备注信息
         *
         * 	成功：返回备注，
         * 	失败返回空
         *
         * */
        function checkComment(ct) {
            var result = '';

            if(_comment instanceof Array) {
                _comment.forEach(function (item) {
                    if(DatePicker.formatDate(item.date).day == ct) {
                        result = item.text;
                    }
                });
            } else if(typeof _comment === 'object') {
                if(DatePicker.formatDate(_comment.date).day == ct) {
                    result = _comment.text;
                }
            }

            return result;
        }

        /*
         *
         * 判断日期是否相等
         *
         * */
        function checkDate(date, arr) {
            var result = false;

            var BreakException = {};
            var d1 = '',
                d2 = '';
            try {
                arr.forEach(function (item) {
                    d1 = DatePicker.formatDate(item.date);
                    d2 = DatePicker.formatDate(date);

                    if(d1.day == d2.day && d1.month == d2.month && d1.year == d2.year) {
                        result = true;
                        throw BreakException;
                    }
                });
            } catch (e) {
                if(e != BreakException) throw e;
            }

            return result;
        }

        //填充内容到盒子里
        $body.append(_bodyHTML);
        $parent.append($section.append($body));

        //填充
        DatePicker.el.html('').append($parent);

        //是否锁定操作
        if(!DEFAULT.lock) {
            /*
             *
             * 选择日期
             *
             * 	DEFAULT.multiple：表示是否支持多选，
             * 	二次点击可以取消选择
             *
             * */
            var selectData = DatePicker.data.selectData;	//选中的数据
            $('[data-selectable=true]').on('click', selectableHandle);

            function selectableHandle() {
                var obj = $(this);

                if(DEFAULT.multiple) {
                    //多选

                    if(!obj.data('confirm')) {
                        //选中
                        obj.data('confirm', true);
                        obj.addClass('active');

                        //存储选中的数据到回调数据中
                        saveDateData(obj.data('date'), obj.data('comment'));
                    } else {
                        //取消
                        obj.data('confirm', false);
                        obj.removeClass('active');

                        //删除选中的数据
                        for(var i = 0; i < selectData.length; i++) {
                            if(selectData[i].date == obj.data('date')) {
                                selectData.splice(i, 1);
                            }
                        }
                    }
                } else {
                    //单选

                    //不可以二次取消
                    if(obj.data('confirm')) {
                        return;
                    }

                    //其他
                    $('[data-selectable=true]').removeClass('active').data('confirm', false);

                    //当前
                    obj.data('confirm', true);
                    obj.addClass('active');

                    //存储选中的数据到回调数据中
                    selectData.length = 0;
                    saveDateData(obj.data('date'), obj.data('comment'));
                }

                //选择事件回调
                if (DEFAULT.selectCallback instanceof Function) {
                    DEFAULT.selectCallback.call(DatePicker.el, DatePicker.data);
                }
            }

            //存储日期数据
            function saveDateData(date, comment) {
                var d = DatePicker.formatDate(date);

                selectData.push({
                    date: d,
                    comment: comment
                });
            }

            /*
             *
             * 切换上下月
             *
             * */
            var $self = this;
            $('[data-target-month]').on('click', function () {
                var $this = $(this);

                $self.full($this.data('target-month'));
            });
        }

    }

    /*
    *
    * 格式化日期
    *   日期格式为：'2017-6-20'
    *
    * */
    DatePicker.formatDate = function (date) {
        var result = null;

        if(typeof date === 'string') {
            var dateArr = date.split('-');
            var dateStr = '';

            for(var i = 0; i < dateArr.length; i++) {
                if(dateArr[i] < 10) {
                    dateArr[i] = '0' + dateArr[i];
                }

                if(i < dateArr.length - 1) {
                    dateStr += dateArr[i] + '-';
                } else {
                    dateStr += dateArr[i];
                }
            }

            if(dateArr.length == 2) {
                dateStr += '-01T00:00:00';
            } else {
                dateStr += 'T00:00:00';
            }

            try {
                var newDate = new Date(dateStr);

                result = {
                    year: newDate.getFullYear(),
                    month: newDate.getMonth() + 1,
                    day: newDate.getDate()
                }

                //星期
                switch(newDate.getDay()) {
                    case 0:
                        result.week = '星期日';
                        break;
                    case 1:
                        result.week = '星期一';
                        break;
                    case 2:
                        result.week = '星期二';
                        break;
                    case 3:
                        result.week = '星期三';
                        break;
                    case 4:
                        result.week = '星期四';
                        break;
                    case 5:
                        result.week = '星期五';
                        break;
                    case 6:
                        result.week = '星期六';
                        break;
                }
            } catch (e) {
                throw '日期错误';
            }
        } else if(typeof date === 'object') {
            if(date.hasOwnProperty('year') && date.hasOwnProperty('month') && date.hasOwnProperty('day') && date.hasOwnProperty('week')) {
                result = date;
            }
        }

        return result;
    };

    /*
     *
     * 格式化备注信息
     *	返回指定年月的所有备注信息
     *
     * 	param
     * 		date：日期，
     * 		cm：未整理的备注信息
     *
     * */
    DatePicker.formatComment = function (date, cm) {
        //数据检查
        if(cm instanceof Array) {
            var cmArr = [];

            cm.forEach(function (item) {
                if(eachCM(item)) {
                    cmArr.push(item);
                }
            });

            if(cmArr.length > 0) {
                return cmArr;
            }

        } else if(typeof cm === 'object') {
            return eachCM(cm);
        }

        //检测是否为对应日期的备注信息
        function eachCM(ec) {
            if(ec.date && ec.text) {
                var _tempDate = DatePicker.formatDate(date);
                var _tempCM = DatePicker.formatDate(ec.date);

                if(_tempDate.year == _tempCM.year && _tempDate.month == _tempCM.month) {
                    return ec;
                }
            }

            return false;
        }

        return false;
    }

    var Plugin = function (options) {
        var _arg = arguments;

        return this.each(function () {
            //参数判断
            if(typeof options === 'object' || !options) {
                return new DatePicker(this, options);
            }
        });
    }

    $.fn.datePicker = Plugin;
    $.fn.datePicker.constructor = DatePicker;
})(window)