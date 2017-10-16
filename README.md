# fy-datepicker
这是一款可以增加备注日历控件，绑定到元素上，并支持纯展示和单选操作，基于Zepto或jQuery（建议Zepto）。

code: [https://coding.net/u/benjiaoxz/p/fy-datePicker/git](https://coding.net/u/benjiaoxz/p/fy-datePicker/git)

pages: [http://benjiaoxz.coding.me/fy-datePicker/examples/index.html](http://benjiaoxz.coding.me/fy-datePicker/examples/index.html)

## 使用

	npm install
	npm start

## 参数

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

**dateBase**：<br>
初始化年月日，默认为当日

格式：

	'2017-6-20'，'2017-6'

**gather**：<br>
数据集合

格式：

	[{date: '2017-6-20', comment: '备注', state: 'select'}...]

	date：日期，必填，
	comment：备注信息
	state：状态，可选（select）、只读（readonly）、禁用（disable）、已选（active），默认可选

**disableSwitch**：<br>
关闭切换月份，默认不关闭

**lock**：<br>
锁定控件上的所有操作，只展示，默认不锁定

**multiple**：<br>
多选，默认可以多选

**before**：<br>
初始化的当日之前是否可选，默认不可选

**after**：<br>
当前月份的后续月份可选数，必须为数字，负数则是前月，默认后两个月

**weekend**： <br>
周末是否可选，默认不可选

**selectCallback**：<br>
选择事件回调

**highlight**：<br>
是否高亮显示含有备注信息的元素，默认显示

## License

[MIT](http://opensource.org/licenses/MIT)
master