# 测试说明
### Description
为后期编写测试文档预留

### Usage
1. install react-addons-perf
2. import

```javascript
    // 在你想要开始测试的地方使用
    Perf.start()
    // 在结束测试的地方使用
    Perf.stop()
    
    // 打印花费的总时间
    Perf.printInclusive(measurements)
    
    // 独占（Exclusive）时间不包含挂载组件的时间
    Perf.printExclusive(measurements)
    
    // 花在根本没有渲染任何东西的组件上的浪费时间
    Perf.printWasted(measurements)
```
