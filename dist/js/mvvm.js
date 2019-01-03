//MVVM 数据绑定的入口
function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data, me = this;
    // 属性代理，实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function(key) {
        //console.log(key)
        me._proxy(key);
    });
    //console.log(data)
    
    observe(data, this);
    this.$compile = new Compile(options.el || document.body, this)
}

MVVM.prototype = {
    _proxy: function(key) {
        var me = this;
        Object.defineProperty(me, key, {//遍历 MVVM 对象 key 定义外层属性名称 world....
            configurable: false,
            enumerable: true,
            set: function(newVal) {
                //console.log("你要赋值给我,我的新值是"+newVal)
                me._data[key] = newVal;//把options.data 属性拉倒最外层
            },
            get: function() {//属性取值
                //console.log('取值---',me._data[key])
                return me._data[key];
            }
        });
        
    }
};