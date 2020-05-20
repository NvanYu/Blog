# 小程序API进行Promise化

> 为了解决异步操作的问题，现代前端开发已经广泛使用await/async方式了，但是小程序的API依然是采用回调的方式，这与现代开发方式有点不符合，为了方便异步操作，需要对其API进行改造，使其支持Promise的方式，这样更方便



## 1、改造函数

```javascript
const promisic = function (func) {
  return function (params = {}) {
    return new Promise((resolve, reject) => {
      const args = Object.assign(params, {
        success: (res) => {
          resolve(res);
        },
        fail: (error) => {
          reject(error);
        },
      });
      func(args);
    });
  };
};

export { promisic };
```



## 2、使用示例

```javascript
class Http {
    static async request({url,data,method='GET'}) {
        const res = await promisic(wx.request)({
            url: `${config.apiBaseUrl}${url}`,
            data,
            method,
            header: { // 这是header是根据项目需求来的，如果项目不需要，则不用写
                appkey: config.appKey
            }
        })
        return res.data;
    }
}
```



此改造方法不仅可以用在wx.request方法上，其他小程序API都可以,例如

1. promisic(wx.request)({url:'xxx',data: 'xxx'})

2. promisic(wx.getStorage)

3. promisic(wx.showToast)



> 当然了，也希望小程序团队能尽快改造原生API，使其支持Promise