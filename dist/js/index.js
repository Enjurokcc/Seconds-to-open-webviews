

//"use strict"

/**
* 属性监听方法
* @name -- 属性名 
*/
// (function (window, undefined) {

//   window.attributeAllData = {};//私有寄存器

//   jvCom = function(_name_) {
//     var _self = this;
//       _self._name_ = _name_;
//     return new jvCom.fn.init(_name_);

//   }

//   jvCom.fn = jvCom.prototype = {

//      version : '1.0.0.0',

//      value : '-attributeDeafult',

//      init : function(_name_){
//       var _self = this;
//       _self._name_ = _name_;
//      },
//      attributeMonitor : function(_name_){
//        attributeAllData[_name_] = {
//         value : "attributeDeafult",
//         setValue: function(val) {
//           this.value = val;
//           //console.log(this.value)
//           return this.value;
//         }
//       }
//       return attributeAllData[_name_];
//      },
//      set : function(v){
//        var _self = this;
//        return jvCom.fn.attributeMonitor(_self._name_).setValue(v);
//      }
//   }
//   jvCom.fn.init.prototype = jvCom.fn;
  
//   attributeAllData.jvCom = window.$  = jvCom;

// })(window);


// console.log($('data1').set({a:1,b:2}));
// console.log($('data2').set(123));
// console.log(attributeAllData)

//console.log($('data1').set({a:1,b:2}));//new obj
//console.log($('data2').set(123));//new obj

// function attributeMonitor(_name_){
//   attributeAllData[_name_] = {
//       value : "attributeDeafult",//存取器 执行getName()时自动替换 默认值
//       getValue: function() {
//        return this.value;
//       },
//       setValue: function(val) {
//        this.value = val;
//       }
//   }
//   return attributeAllData[_name_];
// }
// attributeMonitor('data1').setValue({a:1,b:2});
// console.log(attributeAllData['data1'].getValue());
// attributeMonitor('data2').setValue('hello world2');
// console.log(attributeAllData['data2'].getValue());
// console.log(attributeAllData)


// var a= {}
// Object.defineProperty(a,"b",{
//   value:123456,//属性的值
//   writable:false,//如果为false，属性的值就不能被重写,只能为只读了
//   enumerable:true,//总开关，一旦为false，就不能再设置他的（value，writable，configurable）
//   configurable:true,//是否能在for...in循环中遍历出来或在Object.keys中列举出来。
// })

// console.log(Object.keys(a))


var data = {
    new0 : 123,
    new1 : 456
}
//observe(data);
data.new0 = 'dmq';

function observe(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    // 取出所有属性遍历
    Object.keys(data).forEach(function(key) {
        defineReactive(data, key, data[key]);
    });
};
function defineReactive(data, key, val) {

    var dep = new Dep();//new 一个消息订阅器
    console.log(dep)
    observe(val); // 监听子属性
    Object.defineProperty(data, key, {
        enumerable: true, // 可枚举
        configurable: false, // 不能再define
        get: function() {
            // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
            Dep.target && dep.addDep(Dep.target);
            return val;
        },
        set: function(newVal) {
            if (val === newVal) return;
            console.log('哈哈哈，监听到值变化了 ', val, ' --> ', newVal);
            val = newVal;
            //
            dep.notify(); // 通知所有订阅者
        }
    });
}

function Dep() {//消息订阅器
    this.subs = [];
}
Dep.prototype = {
    addSub: function(sub) {//
        this.subs.push(sub);
    },
    a : {

    },
    notify: function() {//通知
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }
};

function Watcher(vm, exp, cb) {
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    // 此处为了触发属性的getter，从而在dep添加自己，结合Observer更易理解
    this.value = this.get(); 
}
Watcher.prototype = {
    update: function() {
        this.run();    // 属性值变化收到通知
    },
    run: function() {
        var value = this.get(); // 取到最新值
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal); // 执行Compile中绑定的回调，更新视图
        }
    },
    get: function() {
        Dep.target = this;    // 将当前订阅者指向自己
        var value = this.vm[exp];    // 触发getter，添加自己到属性订阅器中
        Dep.target = null;    // 添加完毕，重置
        return value;
    }
};

//解析模板指令
function Compile(el) {
    console.log(el)
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}
Compile.prototype = {
    init: function() { this.compileElement(this.$fragment); },
    node2Fragment: function(el) {
        var fragment = document.createDocumentFragment(), child;
        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    },
    compileElement: function(el) {
        var childNodes = el.childNodes, me = this;
        [].slice.call(childNodes).forEach(function(node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;    // 表达式文本
            // 按元素节点方式编译
            if (me.isElementNode(node)) {
                me.compile(node);
            } else if (me.isTextNode(node) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }
            // 遍历编译子节点
            if (node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        });
    },
    compile: function(node) {
        var nodeAttrs = node.attributes, me = this;
        [].slice.call(nodeAttrs).forEach(function(attr) {
            // 规定：指令以 v-xxx 命名
            // 如 <span v-text="content"></span> 中指令为 v-text
            var attrName = attr.name;    // v-text
            if (me.isDirective(attrName)) {
                var exp = attr.value; // content
                var dir = attrName.substring(2);    // text
                if (me.isEventDirective(dir)) {
                    // 事件指令, 如 v-on:click
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                } else {
                    // 普通指令
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
                }
            }
        });
    }
};

// 指令处理集合
var compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    // ...省略
    bind: function(node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater'];
        // 第一次初始化视图
        updaterFn && updaterFn(node, vm[exp]);
        // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
        new Watcher(vm, exp, function(value, oldValue) {
            // 一旦属性值有变化，会收到通知执行此更新函数，更新视图
            updaterFn && updaterFn(node, value, oldValue);
        });
    }
};

// 更新函数
var updater = {
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    }
    // ...省略
};



//MVVM 数据绑定的入口
function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data, me = this;
    // 属性代理，实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function(key) {
        me._proxy(key);
    });
    observe(data, this);
    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
    _proxy: function(key) {
        var me = this;
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return me._data[key];
            },
            set: function proxySetter(newVal) {
                me._data[key] = newVal;
            }
        });
    }
};

//调用
var vm = new MVVM({
        el: '#mvvm-app',
        data: {
            word: 'Hello World!'
        },
        methods: {
            sayHi: function() {
                this.word = 'Hi, everybody!';
            }
        }
    });




