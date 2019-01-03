
function Compile(el, vm) {
    this.$vm = vm;
    console.log(vm)
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);//如果是元素的节点则直接返回
    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);//暂存文档碎片节点
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    node2Fragment: function(el) {
        var fragment = document.createDocumentFragment(),//创建文档碎片节点
            child;

        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {//指定节点的首个子节点 包括自身
            //console.log(child)
            fragment.appendChild(child);
        }

        return fragment;
    },

    init: function() {
        this.compileElement(this.$fragment);
    },

    compileElement: function(el) {
        var childNodes = el.childNodes,//子节点
            me = this;
        //Array.prototype --> 把类数组对象转换成一个真正的数组
        [].slice.call(childNodes).forEach(function(node) {//循环子节点
            
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;

            if (me.isElementNode(node)) {//元素节点
                me.compile(node);

            } else if (me.isTextNode(node) && reg.test(text)) {//文本节点
                me.compileText(node, RegExp.$1);
            }

            if (node.childNodes && node.childNodes.length) {//轮循降级执行
                me.compileElement(node);
            }
        });
    },

    compile: function(node) {
        var nodeAttrs = node.attributes,
            me = this;
            //console.log(nodeAttrs);

        [].slice.call(nodeAttrs).forEach(function(attr) {
            //console.log('attr元素属性---',attr);
            var attrName = attr.name;
            if (me.isDirective(attrName)) {
                var exp = attr.value;//属性值
                var dir = attrName.substring(2);//截取自定义属性 v- 后面的值
                //console.log('属性句柄----',dir);
                // 事件指令
                if (me.isEventDirective(dir)) {//v-on: event 
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                // 普通指令
                } else {
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
                }

                node.removeAttribute(attrName);//删除v-元素属性
            }
        });
    },

    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },

    isDirective: function(attr) {
        return attr.indexOf('v-') == 0;
    },

    isEventDirective: function(dir) {
        return dir.indexOf('on') === 0;
    },

    isElementNode: function(node) {
        return node.nodeType == 1;
    },

    isTextNode: function(node) {
        return node.nodeType == 3;
    }
};

// 指令处理集合
var compileUtil = {

    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },

    model: function(node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        var me = this,
            val = this._getVMVal(vm, exp);
        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            me._setVMVal(vm, exp, newValue);
            val = newValue;
        });
    },

    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind: function(node, vm, exp, dir) {
        var updaterFn = updater[dir + 'Updater'];
        
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        
        new Watcher(vm, exp, function(value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        });
    },

    // 事件处理
    eventHandler: function(node, vm, exp, dir) {
        var eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];//再次从MVVM对象this参数获取fn
            //固定当前函数,返回另外一个函数
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },

    _getVMVal: function(vm, exp) {
        //console.log(vm)
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k) {
            //console.log(k)
            val = val[k];
        });
        return val;
    },

    _setVMVal: function(vm, exp, value) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};


var updater = {
    textUpdater: function(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;//text节点赋值
    },

    htmlUpdater: function(node, value) {
        node.innerHTML = typeof value == 'undefined' ? '' : value;//html节点赋值
    },

    classUpdater: function(node, value, oldValue) {//class切换
        var className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');

        var space = className && String(value) ? ' ' : '';

        node.className = className + space + value;
    },

    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;//input val 赋值
    }
};